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

		this.browser = await puppeteer.launch({
			'headless': false,
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

	public async crawlUser(name: string, id: string) {
		if(this.browser === null) {
			return;
		}

		const spreadsheets = GoogleSpreadsheets.getInstance();

		await sleep(500);

		const page = await this.browser.newPage();
		await page.goto(`https://twitter.com/${id}/media`, {
			'waitUntil': 'domcontentloaded',
		});

		let shouldWait = true;
		do {
			await sleep(500);

			const length = await page.evaluate((_) => {
				return document.querySelectorAll('.stream-items > li').length;
			});
			if(length > 0) {
				shouldWait = false;
			}
		}
		while(shouldWait);

		let tweets: Array<{
			link: string | null;
			images: string[];
		}> = [];
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
					const permalink = e.querySelector('.js-permalink');
					const link = permalink === null ? null : permalink.getAttribute('href');
					const images = Array.from(e.querySelectorAll('.AdaptiveMedia')).map((e) => {
						return Array.from(e.querySelectorAll('img'));
					}).reduce((a, b) => {
						return a.concat(b);
					}, []).map((e) => {
						return `${e.getAttribute('src')}:orig`;
					});

					return {
						'link': link,
						'images': images,
					};
				});
			});

			try {
				await page.focus('.has-more-items');

				if(prevLength === tweets.length) {
					if(count > 1) {
						shouldScroll = false;
					}
					await sleep(15 * 1000);
					++count;
				}
			}
			catch(err) {
				shouldScroll = false;
			}
		}
		while(shouldScroll);

		console.log(tweets);

		await sleep(500);

		// const images = tweets.map((tweet) => {
		// 	return tweet.images;
		// }).reduce((a, b) => {
		// 	return a.concat(b);
		// }, []);
		// const length = images.length;
		// for(let i = 0; i < length; ++i) {
		// 	const image = images[i];
		// 	console.log(`[${i + 1}/${length}] download url: ${image}`);
		// 	await download(name, image);
		// }

		await page.close();
	}

	public async close() {
		if(this.browser === null) {
			return;
		}
		await this.browser.close();
	}
}
