import {
	GoogleAuth,
	GoogleDrive,
	GoogleSpreadsheets,
	Puppeteer,
	Server,
	Twitter,
} from './libs';

import {
	Processor,
} from './libs/Processor';

import {
	Command,
	ProcessorType,
	CredentialsType,
} from './models';

import {
	sleep,
} from './helpers';

const DRIVE_ID = '1LBftZfGtRYSfNF0azqN3t0u1dNPy05ta';
const SHEETS_ID = '1u8gCPBQB_iWFN-bYJzRBOhOUQ6krwNG51GI_kEKQfCc';

export class App {
	private static instance: App | null = null;

	private shouldProcess: boolean = false;
	private queue: Command[] = [];

	private constructor() {}

	public static createInstance() {
		if(this.instance !== null) {
			throw new Error('cannot create app instance');
		}
		this.instance = new App();
	}

	public static getInstance() {
		if(this.instance === null) {
			throw new Error('app instance is not created');
		}
		return this.instance;
	}

	public async initialize() {
		{
			Server.createInstance();
		}

		{
			const googleAuth = new GoogleAuth(CredentialsType.SPREADSHEETS);
			const auth = await googleAuth.initialize();
			if(auth === null) {
				return;
			}
			GoogleSpreadsheets.createInstance(auth, SHEETS_ID);
		}

	// 	{
	// 		const googleAuth = new GoogleAuth(CredentialsType.DRIVE);
	// 		const auth = await googleAuth.initialize();
	// 		if(auth === null) {
	// 			return;
	// 		}
	// 		GoogleDrive.createInstance(auth, DRIVE_ID);
	// 	}

		{
			const manifest = await GoogleSpreadsheets.getInstance().getManifest();
			Twitter.createInstance(manifest);
			Puppeteer.createInstance(manifest);

			const puppeteer = Puppeteer.getInstance();
			await puppeteer.initialize();
		}
	}

	private getProcessor(type: ProcessorType): Processor | null {
		switch(type) {
		case ProcessorType.DRIVE:
			return GoogleDrive.getInstance();
		case ProcessorType.SPREADSHEETS:
			return GoogleSpreadsheets.getInstance();
		case ProcessorType.TWITTER:
			return Twitter.getInstance();
		default:
			return null;
		}
	}

	private async process(command: Command) {
		const processor = this.getProcessor(command.processorType);
		if(processor === null) {
			return;
		}
		await processor.process(command);
	}

	public pushQueue(command: Command) {
		this.queue.push(command);
	}

	public async stop() {
		this.shouldProcess = false;
	}

	public async start() {
		this.shouldProcess = true;

		// while(this.shouldProcess === true) {
		// 	if(this.queue.length > 0) {
		// 		const command = this.queue.shift()!;
		// 		await this.process(command);
		// 	}

		{
			const spreadsheets = await GoogleSpreadsheets.getInstance();
			const twitter = Twitter.getInstance();

			{
				const ids = await twitter.getFollowings();
				await spreadsheets.appendUsers(ids);
			}

			{
				const sheet = await spreadsheets.getUsers();
				const users = sheet.data.filter((user) => {
					return user.data === undefined;
				});

				for(const user of users) {
					const data = await twitter.getUser(user.id);
					await spreadsheets.updateUser(user, data);
					await sleep(300);
				}
			}
		}

		{
			const spreadsheets = await GoogleSpreadsheets.getInstance();
			const sheet = await spreadsheets.getUsers();
			const users = sheet.data.filter((user) => {
				if(user.alias === undefined) {
					return false;
				}
				if(user.crawled_at !== undefined) {
					return false;
				}
				return true;
			});

			const puppeteer = Puppeteer.getInstance();

			for(const user of users) {
				console.log(`${user.alias} @${user.screen_name}`);
				await puppeteer.crawlUser(user.alias, user.screen_name);
				await spreadsheets.updateUserFlag(user);
				await sleep(1000);
			}
		}
	}
}
