import Twit from 'twit';

import {
	Processor,
} from '../libs';

import {
	Command,
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
		const res = await this.twit.get('users/show', {
			'user_id': id,
		});
		console.log(res);
	}
}
