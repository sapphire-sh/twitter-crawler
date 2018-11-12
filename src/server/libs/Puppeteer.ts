import {
	promises as fsPromises,
} from 'fs';

import path from 'path';

import puppeteer from 'puppeteer';

import {
	Processor,
} from './Processor';

import {
	GoogleSpreadsheets,
} from '../libs';

import {
	Command,
	Manifest,
} from '../models';

import {
	dataPath,
	download,
	sleep,
} from '../helpers';

export class Puppeteer extends Processor {
	private static instance: Puppeteer | null = null;

	private manifest: Manifest;
	private browser: puppeteer.Browser | null = null;
	private page: puppeteer.Page | null = null;

	private constructor(manifest: Manifest) {
		super();

		this.manifest = manifest;
	}

	public static createInstance(manifest: Manifest): void {
		if(this.instance !== null) {
			throw new Error('cannot create puppeteer instance');
		}
		this.instance = new Puppeteer(manifest);
	}

	public static getInstance(): Puppeteer {
		if(this.instance === null) {
			throw new Error('puppeteer instance is not created');
		}
		return this.instance;
	}

	private clearInput(page: puppeteer.Page, selector: string) {
		return page.evaluate((selector: string) => {
			const field = document.querySelector(selector) as HTMLInputElement;
			if(field === null) {
				return;
			}
			field.value = '';
		}, selector);
	}

	public async initialize() {
		const {
			screen_name,
			password,
		} = this.manifest;

		try {
			await fsPromises.lstat(dataPath);
		}
		catch(err) {
			await fsPromises.mkdir(dataPath);
		}

		this.browser = await puppeteer.launch({
			'args': [
				'--no-sandbox',
			],
		});
		const page = await this.browser.newPage();
		await page.goto('https://twitter.com/login', {
			'waitUntil': 'domcontentloaded',
		});

		{
			let shouldWait = true;
			do {
				await sleep(500);

				await this.clearInput(page, '.js-username-field');
				await page.type('.js-username-field', screen_name);

				await sleep(500);

				await this.clearInput(page, '.js-password-field');
				await page.type('.js-password-field', password);

				const values = await page.evaluate((_) => {
					const usernameField = document.querySelector('.js-username-field') as HTMLInputElement;
					const passwordField = document.querySelector('.js-password-field') as HTMLInputElement;

					if(usernameField === null || passwordField === null) {
						return null;
					}
					return {
						'username': usernameField.value,
						'password': passwordField.value,
					};
				});

				if(values.username === screen_name && values.password === password) {
					shouldWait = false;
				}
			}
			while(shouldWait);
		}

		await page.keyboard.press('Enter');

		let shouldWait = true;
		while(shouldWait) {
			await sleep(500);

			try {
				await page.focus('.DashboardProfileCard .username > .u-linkComplex-target');
				shouldWait = false;
			}
			catch(err) {
				shouldWait = true;
			}
		}

		await page.close();
	}

	public async process(command: Command) {
		console.log(command);
	}

	public async crawlUser(screen_name: string, alias: string, ids: string[]) {
		console.log(`crawl ${screen_name}`);
		if(this.browser === null) {
			return;
		}

		await sleep(500);

		const page = await this.browser.newPage();
		await page.goto(`https://twitter.com/${screen_name}/media`, {
			'waitUntil': 'domcontentloaded',
		});

		console.log('dom loaded');

		let shouldWait = true;
		do {
			await sleep(500);

			try {
				const length = await page.evaluate((_) => {
					return document.querySelectorAll('.stream-items > li').length;
				});
				if(length > 0) {
					shouldWait = false;
				}
			}
			catch(err) {
				shouldWait = true;
			}
		}
		while(shouldWait);

		console.log('content loaded');

		let tweets: Array<{
			id: string;
			link: string;
			images: string[];
		}> = [];
		{
			let prevLength = -1;
			let shouldScroll = true;
			let count = 0;
			do {
				prevLength = tweets.length;

				await sleep(500);

				await page.evaluate((_) => {
					window.scrollBy(0, document.documentElement!.scrollHeight);
				});

				tweets = await page.evaluate((_) => {
					return Array.from(document.querySelectorAll('.stream-items > .stream-item')).map((e) => {
						const permalink = e.querySelector('.js-permalink')!;
						const link = permalink.getAttribute('href')!;
						const images = Array.from(e.querySelectorAll('.AdaptiveMedia')).map((e) => {
							return Array.from(e.querySelectorAll('img'));
						}).reduce((a, b) => {
							return a.concat(b);
						}, []).map((e) => {
							return `${e.getAttribute('src')}:orig`;
						});

						return {
							'id': link.split('/').pop(),
							'link': `https://twitter.com${link}`,
							'images': images,
						};
					}).reverse();
				});

				console.log(`tweets: ${tweets.length}`);

				const hasTweet = tweets.some((tweet) => {
					return ids.indexOf(tweet.id!) !== -1;
				});
				if(hasTweet) {
					shouldScroll = false;
					break;
				}

				try {
					await page.focus('.has-more-items');

					if(prevLength === tweets.length) {
						if(count > 30) {
							shouldScroll = false;
							break;
						}
						await sleep(1000);
						++count;
					}
				}
				catch(err) {
					shouldScroll = false;
				}
			}
			while(shouldScroll);
		}

		await sleep(500);

		{
			const spreadsheet = GoogleSpreadsheets.getInstance();

			tweets = tweets.filter((tweet) => {
				if(tweet.id === null) {
					return true;
				}
				return ids.indexOf(tweet.id) === -1;
			}).sort((a, b) => {
				if(a.id.length === b.id.length) {
					return a.id.localeCompare(b.id);
				}
				return a.id.length > b.id.length ? 1 : -1;
			});

			const images = tweets.map((tweet) => {
				return tweet.images;
			}).reduce((a, b) => {
				return a.concat(b);
			}, []);
			console.log(`tweets: ${tweets.length}`);
			console.log(`images: ${images.length}`);

			let count = 1;
			const digitCount = `${images.length}`.length;
			for(const tweet of tweets) {
				for(const image of tweet.images) {
					const index = `${count}`.padStart(digitCount, '0');
					console.log(`[${index}/${images.length}] ${image}`);
					await download(alias, image);
					++count;
				}
				await spreadsheet.appendUserTweets(screen_name, [
					[
						tweet.id,
						tweet.link,
						JSON.stringify(tweet.images),
						(new Date()).toLocaleString(),
					],
				]);
			}
		}

		await page.close();
	}

	public async close() {
		if(this.browser === null) {
			return;
		}
		await this.browser.close();
	}
}
