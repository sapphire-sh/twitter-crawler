import Twit from 'twit';

import {
	Manifest,
} from '../models';

export class Twitter {
	private static instance: Twitter;

	private twit: Twit;

	private constructor(manifest: Manifest) {
		this.twit = new Twit({
			...manifest,
		});
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
}
