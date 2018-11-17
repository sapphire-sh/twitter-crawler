import Twit from 'twit';

export interface TweetDeckConfig {
	userAgent: string;
	bearerToken: string;
	csrfToken: string;
	cookie: string;
}

export enum TweetDeckResponseType {
	TWEETDECK_FETCH_USER_IDS = 'friends/ids',
	TWEETDECK_FETCH_USER = 'users/show',
	TWEETDECK_FETCH_USER_TWEETS = 'search/universal',
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
