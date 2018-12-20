import {
	promises as fsPromises,
} from 'fs';

import puppeteer from 'puppeteer';

import {
	Processor,
} from './Processor';

import {
	Command,
	Manifest,
	TweetDeckConfig,
} from '~/shared/models';

import {
	sleep,
} from '~/shared/helpers';

export class Puppeteer extends Processor {
	private static instance: Puppeteer | null = null;

	private manifest: Manifest;

	private browser: puppeteer.Browser | null = null;

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

	private async waitElement(page: puppeteer.Page, selector: string) {
		let shouldWait = true;
		do {
			await sleep(500);

			try {
				await page.focus(selector);
				shouldWait = false;
			}
			catch(err) {
				shouldWait = true;
			}
		}
		while(shouldWait);
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

	private async login(page: puppeteer.Page) {
		const {
			screen_name,
			password,
		} = this.manifest;

		await this.waitElement(page, '.js-username-field');
		await this.waitElement(page, '.js-password-field');

		{
			let shouldWait = true;
			do {
				await sleep(500);

				await this.clearInput(page, '.js-username-field');
				await page.type('.js-username-field', screen_name);

				await sleep(500);

				await this.clearInput(page, '.js-password-field');
				await page.type('.js-password-field', password);

				const values = await page.evaluate(() => {
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

		return page;
	}

	public async initialize(): Promise<TweetDeckConfig> {
		try {
			await fsPromises.lstat(__directories.data_dir);
		}
		catch(err) {
			await fsPromises.mkdir(__directories.data_dir);
		}

		this.browser = await puppeteer.launch({
			'headless': __dev ? false : true,
			'args': [
				'--no-sandbox',
			],
		});

		const page = await this.browser.newPage();
		await page.goto('https://tweetdeck.twitter.com/', {
			'waitUntil': 'domcontentloaded',
		});

		await this.waitElement(page, '.js-login-form .Button--primary');

		await page.click('.js-login-form .Button--primary');

		await this.login(page);

		await this.waitElement(page, '.tweet-avatar');

		const userAgent = await page.evaluate(() => {
			return window.navigator.userAgent;
		}) as string;

		const bearerToken = await page.evaluate(() => {
			return (window as any).TD.config.bearer_token;
		}) as string;

		const cookie = (await page.cookies()).map((cookie) => {
			return `${cookie.name}="${cookie.value}"`;
		}).join('; ');

		await page.close();

		return {
			'userAgent': userAgent,
			'bearerToken': bearerToken,
			'csrfToken': cookie.match(/ct0="(.+?)";/i)![1],
			'cookie': cookie,
		};
	}

	public async process(command: Command) {
		console.log(command);
	}

	public async close() {
		if(this.browser === null) {
			return;
		}
		await this.browser.close();
	}
}
