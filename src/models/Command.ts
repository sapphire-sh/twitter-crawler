export enum ProcessorType {
	DRIVE = 1,
	SPREADSHEETS,
	TWITTER,
}

export enum CommandType {
	TWITTER_FETCH_USER = 1001,
	TWITTER_CRAWL_USER,
	SPREADSHEETS_UPDATE_USER_DATA = 2001,
}

export interface Command {
	processorType: ProcessorType;
	commandType: CommandType;
	data: any;
}
