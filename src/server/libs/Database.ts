import {
	createConnection,
	getManager,
	Connection,
	ConnectionOptions,
	EntityManager,
} from 'typeorm';

import {
	Twitter,
} from 'twit';

import {
	Processor,
} from './Processor';

import {
	TweetEntity,
	UserEntity,
} from '../entities';

import {
	Command,
	Manifest,
} from '../models';

import {
	convertToBase64,
} from '../helpers';

export class Database extends Processor {
	private static instance: Database | null = null;

	private connection: Connection | null = null;
	private entityManager: EntityManager | null = null;

	private constructor() {
		super();
	}

	public static createInstance() {
		if(this.instance !== null) {
			throw new Error('database instance is already created');
		}
		this.instance = new Database();
	}

	public static getInstance(): Database {
		if(this.instance === null) {
			throw new Error('database instance is not created');
		}
		return this.instance;
	}

	public async process(command: Command) {
		console.log(command);
	}

	public async initialize(manifest: Manifest) {
		const options: ConnectionOptions = {
			'type': 'mysql',
			'host': process.env.HOSTNAME,
			'username': manifest.database_username,
			'password': manifest.database_password,
			'database': manifest.database_name,
			'charset': 'utf8mb4_unicode_ci',
			'entities': [
				TweetEntity,
				UserEntity,
			],
		};
		this.connection = await createConnection(options);
		this.entityManager = getManager();
	}

	private getEntityManager() {
		const entityManager = this.entityManager;

		if(entityManager === null) {
			throw new Error(`entity manager is null`);
		}
		return entityManager;
	}

	public async insertUsers(ids: string[]) {
		const entityManager = this.getEntityManager();

		const filteredIDs: string[] = [];
		for(const id of ids) {
			const user = await entityManager.findOne(UserEntity, id);
			if(user !== undefined) {
				continue;
			}
			filteredIDs.push(id);
		}

		console.log(`user ids to insert: ${filteredIDs.length}`);
		await entityManager.save(filteredIDs.map((id) => {
			return entityManager.create(UserEntity, {
				'id': id,
			});
		}));
	}

	public async selectUsers(): Promise<UserEntity[]> {
		const entityManager = this.getEntityManager();

		return entityManager.find(UserEntity);
	}

	public async updateUser(user: Partial<UserEntity> & {
		id: string;
	}) {
		const entityManager = this.getEntityManager();

		await entityManager.update(UserEntity, user.id, {
			...user,
		});
	}

	public async insertTweets(tweets: Twitter.Status[]) {
		console.time(`insert tweets`);
		const entityManager = this.getEntityManager();

		await entityManager.save(tweets.map((tweet) => {
			return entityManager.create(TweetEntity, {
				'id': tweet.id_str,
				'user_id': tweet.user.id_str,
				'data': convertToBase64(JSON.stringify(tweet)),
			});
		}));
		console.timeEnd(`insert tweets`);
	}

	public async selectTweet(userID: string): Promise<string | undefined> {
		console.time(`select tweet`);
		const entityManager = this.getEntityManager();

		const tweet = await entityManager.findOne(TweetEntity, {
			'select': [
				'id',
			],
			'where': {
				'user_id': userID,
			},
			'order': {
				'id': 'ASC',
			},
		});

		console.timeEnd(`select tweet`);
		if(tweet === undefined) {
			return undefined;
		}
		return tweet.id;
	}

	public async close() {
		if(this.connection === null) {
			return;
		}
		await this.connection.close();
	}
}
