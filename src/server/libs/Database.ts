import {
	createConnection,
	getManager,
	Connection,
	ConnectionOptions,
	EntityManager,
} from 'typeorm';

import {
	Processor,
} from './Processor';

import {
	UserEntity,
} from '../entities';

import {
	Command,
	Manifest,
} from '../models';

enum Tables {
	TABLE_USERS = 'users',
	TABLE_TWEETS = 'tweets',
	TABLE_MEDIAS = 'medias',
}

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

	// private async initializeTable<T extends Tables>(tableName: T) {
	// 	const exists = await this.knex.schema.hasTable(tableName);
	// 	if(exists) {
	// 		return;
	// 	}
	// 	await this.knex.schema.createTable(tableName, (table) => {
	// 		table.bigInteger('id').primary().index().unique();
	// 		switch(tableName) {
	// 			case Tables.TABLE_USERS:
	// 				table.string('alias').notNullable().defaultTo('');
	// 				table.string('name').notNullable().defaultTo('');
	// 				table.string('screen_name').notNullable().defaultTo('');
	// 				table.integer('crawled_at').notNullable().defaultTo(0);
	// 				break;
	// 			case Tables.TABLE_TWEETS:
	// 				table.bigInteger('user_id').notNullable();
	// 				table.string('link').notNullable();
	// 				break;
	// 			case Tables.TABLE_MEDIAS:
	// 				table.bigInteger('tweet_id').notNullable();
	// 				break;
	// 		}
	// 		table.timestamps(true, true);
	// 	});
	// }

	public async initialize(manifest: Manifest) {
		const options: ConnectionOptions = {
			'type': 'mysql',
			'host': process.env.HOSTNAME,
			'username': manifest.database_username,
			'password': manifest.database_password,
			'database': manifest.database_name,
			'charset': 'utf8mb4_unicode_ci',
			'entities': [
				UserEntity,
			],
		};
		this.connection = await createConnection(options);
		this.entityManager = getManager();

		// for(const key in Tables) {
		// 	if(isNaN(Number(key)) === false) {
		// 		continue;
		// 	}
		// 	const value = Tables[key] as Tables;
		// 	await this.initializeTable(value);
		// }
	}

	// private async select<T extends Tables>(tableName: T, id: string) {
	// 	const ids = await this.knex(tableName).where({
	// 		'id': id,
	// 	}) as string[];
	// 	return ids;
	// }

	// private async update<T extends Tables>(tableName: T, data: any) {
	// 	const id = data.id;
	// 	delete data.id;

	// 	await this.knex(tableName).where({
	// 		'id': id,
	// 	}).update(data);
	// }

	public async insertUsers(ids: string[]) {
		const entityManager = this.entityManager;

		if(entityManager === null) {
			throw new Error(`entity manager is null`);
		}

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
		const entityManager = this.entityManager;

		if(entityManager === null) {
			throw new Error(`entity manager is null`);
		}

		return entityManager.find(UserEntity);
	}

	public async updateUser(user: Partial<UserEntity> & {
		id: string;
	}) {
		const entityManager = this.entityManager;

		if(entityManager === null) {
			throw new Error(`entity manager is null`);
		}

		await entityManager.update(UserEntity, user.id, {
			...user,
		});
	}

	public async close() {
		if(this.connection === null) {
			return;
		}
		await this.connection.close();
	}
}
