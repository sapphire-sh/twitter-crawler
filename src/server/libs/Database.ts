import Knex from 'knex';

import {
	Processor,
} from './Processor';

import {
	Command,
	User,
	Tweet,
	Media,
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
		if (this.instance !== null) {
			throw new Error('database instance is already created');
		}
		this.instance = new Database(config);
	}

	public static getInstance(): Database {
		if (this.instance === null) {
			throw new Error('database instance is not created');
		}
		return this.instance;
	}

	public async process(command: Command) {
		console.log(command);
	}

	private async initializeTable<T extends Tables>(tableName: T) {
		const exists = await this.knex.schema.hasTable(tableName);
		if (exists) {
			return;
		}
		await this.knex.schema.createTable(tableName, (table) => {
			table.bigInteger('id').primary();
			switch (tableName) {
				case Tables.TABLE_USERS:
					table.string('alias').nullable();
					table.string('data').notNullable();
					table.date('crawled_at').nullable();
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
		for (const key in Tables) {
			if (isNaN(Number(key)) === false) {
				continue;
			}
			const value = Tables[key] as Tables;
			await this.initializeTable(value);
		}
	}

	private async insert<T extends Tables>(tableName: T, data: any) {
		await this.knex(tableName).insert(data);
	}
}
