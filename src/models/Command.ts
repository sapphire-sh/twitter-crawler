export enum CommandType {
	DRIVE = 1,
	SPREADSHEETS,
	TWITTER,
}

export interface Command {
	ts: number;
	type: CommandType;
	data: any;
}
