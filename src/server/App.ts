import {
	Database,
	GoogleAuth,
	GoogleDrive,
	GoogleSpreadsheets,
	Puppeteer,
	TweetDeck,
} from './libs';

import {
	Processor,
} from './libs/Processor';

import {
	Command,
	ProcessorType,
	CredentialsType,
	DatabaseUserQueryType,
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
		// {
		// 	const googleAuth = new GoogleAuth(CredentialsType.SPREADSHEETS);
		// 	const auth = await googleAuth.initialize();
		// 	if(auth === null) {
		// 		return;
		// 	}
		// 	GoogleSpreadsheets.createInstance(auth, SHEETS_ID);
		// }

		// {
		// 	const spreadsheets = GoogleSpreadsheets.getInstance();
		// 	const manifest = await spreadsheets.getManifest();

		// 	Puppeteer.createInstance(manifest);
		// 	Database.createInstance({
		// 		'client': 'mysql',
		// 		'connection': {
		// 			'host': process.env.HOSTNAME,
		// 			'user': 'sapphire',
		// 			'password': manifest.database_password,
		// 			'database': 'twitter-crawler',
		// 		},
		// 	});
		// }

		{
			const database = Database.getInstance();
			await database.initialize();
		}

		// {
		// 	const puppeteer = Puppeteer.getInstance();
		// 	const config = await puppeteer.initialize();

		// 	TweetDeck.createInstance(config);
		// }

		// {
		// 	const puppeteer = Puppeteer.getInstance();
		// 	await puppeteer.close();
		// }
	}

	private getProcessor(type: ProcessorType): Processor | null {
		switch(type) {
		case ProcessorType.DRIVE:
			return GoogleDrive.getInstance();
		case ProcessorType.SPREADSHEETS:
			return GoogleSpreadsheets.getInstance();
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

		const database = Database.getInstance();
		// const tweetdeck = TweetDeck.getInstance();

		// while(this.shouldProcess === true) {
		// 	if(this.queue.length > 0) {
		// 		const command = this.queue.shift()!;
		// 		await this.process(command);
		// 	}

		// {
		// 	const ids = await tweetdeck.getUserIDs();
		// 	console.log(`user ids fetched: ${ids.length}`);

		// 	await database.insertUsers(ids);
		// 	await sleep(50);
		// }

		// {
		// 	const users = await database.selectUsers(DatabaseUserQueryType.DATABASE_USER_QUERY_WITHOUT_NAME);

		// 	for(const user of users) {
		// 		const res = await tweetdeck.getUser(user.id);

		// 		const {
		// 			screen_name,
		// 			name,
		// 		} = res;

		// 		console.log(`user fetched: ${name} ${screen_name}`);

		// 		await database.updateUser({
		// 			'id': user.id,
		// 			'screen_name': screen_name,
		// 			'name': name,
		// 		});

		// 		await sleep(100);
		// 	}
		// }

		await database.insertUsers(Array.from(Array(10)).map((_, i) => {
			return `${i}`;
		}));

		await sleep(50);

		await database.updateUser({
			'id': '1',
			'name': 'カイシンシ月東イｰ２３a🍆',
		});

		await database.close();
	}
}
