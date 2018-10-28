import {
	GoogleAuth,
	GoogleDrive,
	GoogleSpreadsheets,
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

		while(this.shouldProcess === true) {
			if(this.queue.length > 0) {
				const command = this.queue.shift()!;
				await this.process(command);
			}

			{
				const spreadsheetsInstance = await GoogleSpreadsheets.getInstance();
				const sheet = await spreadsheetsInstance.getUsers();
				const users = sheet.data.filter((user) => {
					return user.data === undefined;
				});

				const twitterInstance = Twitter.getInstance();
				for(const user of users) {
					const {
						data,
					} = await twitterInstance.getUser(user.id) as any;
					console.log(`${data.id_str} ${data.screen_name}`);
					await spreadsheetsInstance.updateUser(user, data);
					await sleep(1000);
				}
			}

			await sleep(10000);
		}

		{
			// GoogleSpreadsheet.getInstance().getUsers();
			// const accounts = await Twitter.getInstance().getFollowings();
			// GoogleSpreadsheet.getInstance().setAccounts(accounts);
		}

		{
			// await Twitter.getInstance().getRateLimitStatus();
		}

		{
			// await Twitter.getInstance().getUser('1041275214821187587');
		}

		// {
		// 	const googleAuth = new GoogleAuth<CredentialsType.DRIVE>(CredentialsType.DRIVE);
		// 	const auth = await googleAuth.initialize();
		// 	if(auth === null) {
		// 		return;
		// 	}
		// 	const googleDrive = new GoogleDrive(auth, DRIVE_ID);

		// 	let directories = await googleDrive.getDirectories('root');
		// 	directories = directories.filter((directory) => {
		// 		return directory.name === 'twitter-crawler';
		// 	});
		// 	if(directories.length === 1) {
		// 		console.log(directories.pop());
		// 	}
		// }
	}
}
