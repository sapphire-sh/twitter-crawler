import {
	Processor,
	GoogleAuth,
	GoogleDrive,
	GoogleSpreadsheets,
	Twitter,
} from './libs';

import {
	Command,
	CommandType,
	CredentialsType,
} from './models';

import {
	sleep,
} from './helpers';

const DRIVE_ID = '1LBftZfGtRYSfNF0azqN3t0u1dNPy05ta';
const SHEETS_ID = '1u8gCPBQB_iWFN-bYJzRBOhOUQ6krwNG51GI_kEKQfCc';

export class App {
	private shouldProcess: boolean = false;
	private queue: Command[] = [];

	public async initialize() {
		{
			const googleAuth = new GoogleAuth(CredentialsType.SPREADSHEETS);
			const auth = await googleAuth.initialize();
			if(auth === null) {
				return;
			}
			GoogleSpreadsheets.createInstance(auth, SHEETS_ID);
		}

		{
			const googleAuth = new GoogleAuth(CredentialsType.DRIVE);
			const auth = await googleAuth.initialize();
			if(auth === null) {
				return;
			}
			GoogleDrive.createInstance(auth, DRIVE_ID);
		}

		{
			const manifest = await GoogleSpreadsheets.getInstance().getManifest();
			Twitter.createInstance(manifest);
		}
	}

	private getProcessorInstance(type: CommandType): Processor | null {
		switch(type) {
		case CommandType.DRIVE:
			return GoogleDrive.getInstance();
		case CommandType.SPREADSHEETS:
			return GoogleSpreadsheets.getInstance();
		case CommandType.TWITTER:
			return Twitter.getInstance();
		default:
			return null;
		}
	}

	private async process(command: Command) {
		const processor = this.getProcessorInstance(command.type);
		if(processor === null) {
			return;
		}
		await processor.process(command);
	}

	public async stop() {
		this.shouldProcess = false;
	}

	public async start() {
		this.shouldProcess = true;

		while(this.shouldProcess === true) {
			const now = Date.now();

			let shouldSkip: boolean = false;
			let command: Command | null = null;
			this.queue = this.queue.filter((e) => {
				if(shouldSkip === true) {
					return true;
				}
				if(e.ts <= now) {
					command = e;
					shouldSkip = true;
					return false;
				}
				return true;
			});

			if(command !== null) {
				await this.process(command);
			}

			await sleep(1000);
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
