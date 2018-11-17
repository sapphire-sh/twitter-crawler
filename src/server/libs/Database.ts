import Knex from 'knex';

import {
	Processor,
} from './Processor';

import {
	Command,
	DatabaseUserQueryType,
	UserSchema,
} from '../models';

enum Tables {
	TABLE_USERS = 'users',
	TABLE_TWEETS = 'tweets',
	TABLE_MEDIAS = 'medias',
}

export class Database extends Processor {
	private static instance: Database | null = null;

	private knex: Knex;

	private constructor(config: Knex.Config) {
		super();

		this.knex = Knex(config);
	}

	public static createInstance(config: Knex.Config) {
		if(this.instance !== null) {
			throw new Error('database instance is already created');
		}
		this.instance = new Database(config);
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

	private async initializeTable<T extends Tables>(tableName: T) {
		const exists = await this.knex.schema.hasTable(tableName);
		if(exists) {
			return;
		}
		await this.knex.schema.createTable(tableName, (table) => {
			table.bigInteger('id').primary().index().unique();
			switch(tableName) {
				case Tables.TABLE_USERS:
					table.string('alias').notNullable().defaultTo('');
					table.string('name').notNullable().defaultTo('');
					table.string('screen_name').notNullable().defaultTo('');
					table.integer('crawled_at').notNullable().defaultTo(0);
					break;
				case Tables.TABLE_TWEETS:
					table.bigInteger('user_id').notNullable();
					table.string('link').notNullable();
					break;
				case Tables.TABLE_MEDIAS:
					table.bigInteger('tweet_id').notNullable();
					break;
			}
			table.timestamps(true, true);
		});
	}

	public async initialize() {
		for(const key in Tables) {
			if(isNaN(Number(key)) === false) {
				continue;
			}
			const value = Tables[key] as Tables;
			await this.initializeTable(value);
		}
	}

	private async select<T extends Tables>(tableName: T, id: string) {
		const ids = await this.knex(tableName).where({
			'id': id,
		}) as string[];
		return ids;
	}

	private async insert<T extends Tables>(tableName: T, data: any) {
		await this.knex(tableName).insert(data);
	}

	private async update<T extends Tables>(tableName: T, data: any) {
		const id = data.id;
		delete data.id;

		await this.knex(tableName).where({
			'id': id,
		}).update(data);
	}

	public async insertUsers(ids: string[]) {
		const tableName = Tables.TABLE_USERS;

		const filteredIDs: string[] = [];
		for(const id of ids) {
			const rows = await this.select(tableName, id);
			if(rows.length > 0) {
				continue;
			}
			filteredIDs.push(id);
		}

		console.log(`user ids to insert: ${filteredIDs.length}`);
		await this.insert(tableName, filteredIDs.map((id) => {
			return {
				'id': id,
			};
		}));
	}

	public async selectUsers(type: DatabaseUserQueryType): Promise<UserSchema[]> {
		const builder = this.knex(Tables.TABLE_USERS);

		switch(type) {
			case DatabaseUserQueryType.DATABASE_USER_QUERY_WITHOUT_ALIAS:
				return builder.where({
					'alias': '',
				});
			case DatabaseUserQueryType.DATABASE_USER_QUERY_WITHOUT_NAME:
				return builder.where({
					'name': '',
				});
			case DatabaseUserQueryType.DATABASE_USER_QUERY_FOR_CRAWL:
				const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
				return builder.whereNot({
					'alias': '',
				}).andWhere('crawled_at', '<=', threshold);
		}
	}

	public async updateUser(user: Partial<UserSchema> & {
		id: string;
	}) {
		const tableName = Tables.TABLE_USERS;

		const {
			id,
		} = user;

		const rows = await this.select(tableName, id);
		if(rows.length === 0) {
			return;
		}
		await this.update(tableName, user);
	}

	public async close() {
		await this.knex.destroy();
	}
}
