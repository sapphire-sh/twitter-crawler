import Twit from 'twit';

import {
	Manifest,
} from '../models';

export class Twitter {
	private static instance: Twitter;

	private twit: Twit;

	private queue: any[];

	private constructor(manifest: Manifest) {
		this.twit = new Twit({
			...manifest,
		});
		this.queue = [];
	}

	public static createInstance(manifest: Manifest) {
		if(this.instance !== null) {
			throw new Error();
		}
		this.instance = new Twitter(manifest);
	}

	public static getInstance(): Twitter {
		if(this.instance === null) {
			throw new Error();
		}
		return this.instance;
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
