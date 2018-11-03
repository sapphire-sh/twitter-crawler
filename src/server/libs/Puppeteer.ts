import path from 'path';

import puppeteer from 'puppeteer';

import {
	Processor,
} from './Processor';

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
		await page.type('.js-username-field', screen_name);
		await page.type('.js-password-field', password);
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

		let shouldScroll = true;
		do {
			await sleep(500);

			try {
				await page.focus('.has-more-items');
			}
			catch(err) {
				shouldScroll = false;
			}
			await page.evaluate((_) => {
				window.scrollBy(0, document.documentElement!.scrollHeight);
			});
		}
		while(shouldScroll);

		let images = [];
		do {
			await sleep(500);

			images = await page.evaluate((_) => {
				return Array.from(document.querySelectorAll('.AdaptiveMedia')).map((e) => {
					return Array.from(e.querySelectorAll('img'));
				}).reduce((a, b) => {
					return a.concat(b);
				}, []).map((e) => {
					return `${e.getAttribute('src')}:orig`;
				});
			});
		}
		while(images.length === 0);

		for(const image of images) {
			console.log(`[${images.indexOf(image) + 1}/${images.length}] download url: ${image}`);
			await download(name, image);
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
