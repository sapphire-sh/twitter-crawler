import request from 'request';

import {
	Processor,
} from './Processor';

import {
	Command,
	TweetDeckConfig,
	TweetDeckRequestType,
	TweetDeckFetchRateLimitStatusResponse,
	TweetDeckFetchUserIDsResponse,
	TweetDeckFetchUserResponse,
	TweetDeckFetchUserTweetsResponse,
} from '../models';

export class TweetDeck extends Processor {
	private static instance: TweetDeck | null = null;

	private config: TweetDeckConfig;

	private constructor(config: TweetDeckConfig) {
		super();

		this.config = config;
	}

	public static createInstance(config: TweetDeckConfig) {
		if(this.instance !== null) {
			throw new Error('tweetdeck instance already exists');
		}
		this.instance = new TweetDeck(config);
	}

	public static getInstance() {
		if(this.instance === null) {
			throw new Error('tweetdeck instance does not exist');
		}
		return this.instance;
	}

	public async process(command: Command) {
		console.log(command);
	}

	private getURL(type: string, params?: any): string {
		const url = `https://api.twitter.com/1.1/${type}.json`;

		if(params === undefined) {
			return url;
		}

		return `${url}?${Object.keys(params).map((key) => {
			const param = params[key];
			return `${key}=${encodeURIComponent(param)}`;
		}).join('&')}`;
	}

	private async sendRequest(type: TweetDeckRequestType.TWEETDECK_FETCH_RATE_LIMIT_STATUS): Promise<TweetDeckFetchRateLimitStatusResponse>;
	private async sendRequest(type: TweetDeckRequestType.TWEETDECK_FETCH_USER_IDS, params?: any): Promise<TweetDeckFetchUserIDsResponse>;
	private async sendRequest(type: TweetDeckRequestType.TWEETDECK_FETCH_USER, params?: any): Promise<TweetDeckFetchUserResponse>;
	private async sendRequest(type: TweetDeckRequestType.TWEETDECK_FETCH_USER_TWEETS, params?: any): Promise<TweetDeckFetchUserTweetsResponse>;
	private async sendRequest(type: TweetDeckRequestType, params?: any) {
		const {
			userAgent,
			bearerToken,
			csrfToken,
			cookie,
		} = this.config;

		return new Promise((resolve, reject) => {
			request({
				'url': this.getURL(type, params),
				'headers': {
					'authorization': `Bearer ${bearerToken}`,
					'cookie': cookie,
					'user-agent': userAgent,
					'x-csrf-token': csrfToken,
				},
			}, (err, _, body) => {
				if(err) {
					return reject(err);
				}

				resolve(JSON.parse(body));
			});
		});
	}

	private getQuery(screenName: string, maxID?: string) {
		const query: any = {
			'from': screenName,
			'max_id': maxID,
		};

		return Object.keys(query).map((key) => {
			const value = query[key];
			if(value === undefined) {
				return '';
			}
			return `${key}:${value}`;
		}).join(' ');
	}

	public async getRateLimitStatus() {
		const type = TweetDeckRequestType.TWEETDECK_FETCH_RATE_LIMIT_STATUS;

		const res = await this.sendRequest(type);
		console.log(res);
	}

	public async getUserIDs() {
		const type = TweetDeckRequestType.TWEETDECK_FETCH_USER_IDS;
		const params = {
			'stringify_ids': true,
		};

		const res = await this.sendRequest(type, params);
		return res.ids;
	}

	public async getUser(id: string) {
		const type = TweetDeckRequestType.TWEETDECK_FETCH_USER;
		const params = {
			'user_id': id,
		};

		const res = await this.sendRequest(type, params);
		return res;
	}

	public async getTweets(screenName: string, maxID?: string) {
		console.time(`get tweets`);
		const type = TweetDeckRequestType.TWEETDECK_FETCH_USER_TWEETS;
		const params = {
			'q': this.getQuery(screenName, maxID),
			'count': 500,
			'modules': 'status',
			'result_type': 'recent',
			'pc': false,
			'ui_lang': 'en-US',
			'cards_platform': 'Web-13',
			'include_entities': 1,
			'include_user_entities': 1,
			'include_cards': 1,
			'send_error_codes': 1,
			'tweet_mode': 'extended',
			'include_ext_alt_text': true,
			'include_reply_count': true,
		};

		const res = await this.sendRequest(type, params);
		console.timeEnd(`get tweets`);
		return res.modules.map((module) => {
			return module.status.data;
		});
	}
}
