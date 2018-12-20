import Twit from 'twit';

export interface TweetDeckConfig {
	userAgent: string;
	bearerToken: string;
	csrfToken: string;
	cookie: string;
}

export enum TweetDeckRequestType {
	TWEETDECK_FETCH_RATE_LIMIT_STATUS = 'application/rate_limit_status',
	TWEETDECK_FETCH_USER_IDS = 'friends/ids',
	TWEETDECK_FETCH_USER = 'users/show',
	TWEETDECK_FETCH_USER_TWEETS = 'search/universal',
}

interface RateLimitStatus {
	limit: number;
	remaining: number;
	reset: number;
}

export interface TweetDeckFetchRateLimitStatusResponse {
	rate_limit_context: {
		access_token: string;
	};
	resources: {
		application: {
			'application/rate_limit_status': RateLimitStatus;
		};
		friends: {
			'friends/ids': RateLimitStatus;
		};
		search: {
			'/search/universal': RateLimitStatus;
		};
		users: {
			'/users/show/:id': RateLimitStatus;
		};
	};
}

export interface TweetDeckFetchUserIDsResponse {
	ids: string[];
	next_cursor: number;
	next_cursor_str: number;
	previous_cursor: number;
	previous_cursor_str: number;
	total_count: number | null;
}

export type TweetDeckFetchUserResponse = Twit.Twitter.User;

export interface TweetDeckFetchUserTweetsResponse {
	modules: Array<{
		status: {
			data: Twit.Twitter.Status;
		};
	}>;
}
