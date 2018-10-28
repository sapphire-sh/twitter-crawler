import Twit from 'twit';

import {
	CommandFactory,
} from '../libs';

import {
	Processor,
} from '../libs/Processor';

import {
	Command,
	CommandType,
	Manifest,
} from '../models';

export class Twitter extends Processor {
	private static instance: Twitter | null = null;

	private twit: Twit;

	private constructor(manifest: Manifest) {
		super();

		this.twit = new Twit(manifest);
	}

	public static createInstance(manifest: Manifest) {
		if(this.instance !== null) {
			throw new Error('cannot create twitter instance');
		}
		this.instance = new Twitter(manifest);
	}

	public static getInstance(): Twitter {
		if(this.instance === null) {
			throw new Error('twitter instance is not created');
		}
		return this.instance;
	}

	public async process(command: Command) {
		switch(command.commandType) {
		case CommandType.TWITTER_FETCH_USER:
			const id: string = command.data;
			const user = await this.getUser(id);
			{
				const command = CommandFactory.createCommand(CommandType.SPREADSHEETS_UPDATE_USER_DATA, user);
			}
			return;
		case CommandType.TWITTER_CRAWL_USER:
			return;
		}
		return;
	}

	public async getFollowings() {
		const res = await this.twit.get('friends/ids', {
			'stringify_ids': true,
			'count': 5000,
		});
		const {
			ids,
		} = res.data as any;
		return ids;
	}

	public async getRateLimitStatus() {
		const res = await this.twit.get('application/rate_limit_status');
		console.log(res);
	}

	public async getUser(id: string) {
		return this.twit.get('users/show', {
			'user_id': id,
		});
	}

	public async getUserTweets(userID: string) {
		const res = await this.twit.get('statuses/user_timeline', {
			'user_id': userID,
			'count': 200,
		});
		console.log(res);
	}
}
