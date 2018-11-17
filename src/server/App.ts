import {
	Database,
	GoogleAuth,
	GoogleSpreadsheets,
	Puppeteer,
	TweetDeck,
} from './libs';

import {
	UserEntity,
} from './entities';

import {
	Command,
	CredentialsType,
} from './models';

import {
	sleep,
} from './helpers';

const DRIVE_ID = '1LBftZfGtRYSfNF0azqN3t0u1dNPy05ta';
const SHEETS_ID = '14ls6Zi-78B_pGqKEe_f4qrP_7HL5zkKoKU5ofrGR9Pk';

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
			const googleAuth = new GoogleAuth(CredentialsType.SPREADSHEETS);
			const auth = await googleAuth.initialize();
			if(auth === null) {
				return;
			}
			GoogleSpreadsheets.createInstance(auth, SHEETS_ID);
		}

		{
			Database.createInstance();
		}

		{
			const spreadsheets = GoogleSpreadsheets.getInstance();
			const database = Database.getInstance();

			const manifest = await spreadsheets.getManifest();

			Puppeteer.createInstance(manifest);
			await database.initialize(manifest);
		}

		{
			const puppeteer = Puppeteer.getInstance();
			const config = await puppeteer.initialize();

			TweetDeck.createInstance(config);
		}

		{
			const puppeteer = Puppeteer.getInstance();
			await puppeteer.close();
		}
	}

	private async process(command: Command) {
		console.log(command);
	}

	public pushQueue(command: Command) {
		this.queue.push(command);
	}

	public async stop() {
		this.shouldProcess = false;
	}

	private async addUsers() {
		const database = Database.getInstance();
		const tweetdeck = TweetDeck.getInstance();

		const ids = await tweetdeck.getUserIDs();
		console.log(`user ids fetched: ${ids.length}`);

		await database.insertUsers(ids);
	}

	private async updateUsers() {
		const database = Database.getInstance();
		const tweetdeck = TweetDeck.getInstance();

		const userEntities = await database.selectUsers();

		for(const userEntity of userEntities) {
			const {
				id,
			} = userEntity;

			{
				const {
					name,
					screen_name,
				} = userEntity;

				if(name !== '' && screen_name !== '') {
					continue;
				}
			}

			const user = await tweetdeck.getUser(id);

			const {
				screen_name,
				name,
			} = user;

			console.log(`user fetched: ${name} ${screen_name}`);

			await database.updateUser({
				'id': userEntity.id,
				'screen_name': screen_name,
				'name': name,
			});

			await sleep(50);
		}
	}

	private async syncUsers() {
		const database = Database.getInstance();
		const spreadsheets = GoogleSpreadsheets.getInstance();

		const userEntities = await database.selectUsers();

		const users = await spreadsheets.getUsers();
		if(users === null) {
			throw new Error(`users sheet does not exist`);
		}

		await spreadsheets.appendUsers(userEntities.filter((userEntity) => {
			return users.find((user) => {
				return user.id === userEntity.id;
			}) === null;
		}));

		for(const userEntity of userEntities) {
			if(userEntity.alias !== '') {
				continue;
			}

			const user = users.find((user) => {
				return user.id === userEntity.id;
			});
			if(user === null || user.alias === '') {
				continue;
			}

			await database.updateUser({
				'id': userEntity.id,
				'alias': user.alias,
			});
		}
	}

	private async fetchTweets() {
		const database = Database.getInstance();
		const tweetdeck = TweetDeck.getInstance();

		const users = await database.selectUsers();
		for(const user of users) {
			console.log(`crawl user: ${user.screen_name}`);

			let shouldProcess = true;
			do {
				const tweet = await database.selectTweet(user.id);

				const maxID = tweet === null ? undefined : tweet.id;
				const tweets = await tweetdeck.getTweets(user.screen_name, maxID);

				if(tweets.length <= 1) {
					shouldProcess = false;
					break;
				}

				console.log(tweets[0].id_str);

				await database.insertTweets(tweets);

				await sleep(500);
			}
			while(shouldProcess);

			await sleep(50);
		}
		await database.insertTweets([]);
	}

	public async start() {
		this.shouldProcess = true;

		do {
			await this.addUsers();
			await sleep(50);

			await this.updateUsers();
			await sleep(50);

			await this.syncUsers();
			await sleep(50);

			await this.fetchTweets();
			await sleep(50);

			await sleep(60 * 1000);
		}
		while(this.shouldProcess);

		const database = Database.getInstance();
		await database.close();
	}
}
