import {
	CommandType,
	ProcessorType,
} from '~/shared/models';

import {
	CommandFactory,
} from './Command';

describe('./server/libs/Command.ts', () => {
	test('createCommand', () => {
		const data = {};

		const command = CommandFactory.createCommand(CommandType.TWITTER_FETCH_USER, data);
		expect(command).toEqual({
			'commandType': CommandType.TWITTER_FETCH_USER,
			'processorType': ProcessorType.TWITTER,
			'data': data,
		});
	});
});
