import {
	Command,
	CommandType,
	ProcessorType,
} from '../models';

export class CommandFactory {
	private static getProcessorType(type: CommandType): ProcessorType {
		switch(type) {
		case CommandType.TWITTER_FETCH_USER:
		case CommandType.TWITTER_CRAWL_USER:
			return ProcessorType.TWITTER;
		case CommandType.SPREADSHEETS_UPDATE_USER_DATA:
			return ProcessorType.SPREADSHEETS;
		}
	}

	public static createCommand(type: CommandType, data: any): Command {
		return {
			'commandType': type,
			'processorType': this.getProcessorType(type),
			'data': data,
		};
	}
}
