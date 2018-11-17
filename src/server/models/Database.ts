export enum DatabaseUserQueryType {
	DATABASE_USER_QUERY_WITHOUT_NAME = 'DATABASE_USER_QUERY_WITHOUT_NAME',
	DATABASE_USER_QUERY_WITHOUT_ALIAS = 'DATABASE_USER_QUERY_WITHOUT_ALIAS',
	DATABASE_USER_QUERY_FOR_CRAWL = 'DATABASE_USER_QUERY_FOR_CRAWL',
}

export interface UserSchema {
	id: string;
	alias: string;
	name: string;
	screen_name: string;
	crawled_at: number;
}

export interface TweetSchema {
	id: string;
}
