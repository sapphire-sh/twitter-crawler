import {
	google,
	sheets_v4,
} from 'googleapis';

import {
	OAuth2Client,
} from 'google-auth-library';

import Twit from 'twit';

import {
	Account,
	Manifest,
} from '../models';

export class GoogleSpreadsheet {
	private static instance: GoogleSpreadsheet;

	private auth: OAuth2Client;
	private id: string;
	private sheets: sheets_v4.Sheets;

	private constructor(auth: OAuth2Client, id: string) {
		this.auth = auth;
		this.id = id;
		this.sheets = google.sheets({
			'version': 'v4',
			'auth': this.auth,
		});
	}

	public static createInstance(auth: OAuth2Client, id: string) {
		if(this.instance !== null) {
			throw new Error();
		}
		this.instance = new GoogleSpreadsheet(auth, id);
	}

	public static getInstance(): GoogleSpreadsheet {
		if(this.instance === null) {
			throw new Error();
		}
		return this.instance;
	}

	public async getManifest(): Promise<Manifest> {
		const res = await this.sheets.spreadsheets.values.get({
			'spreadsheetId': this.id,
			'range': 'manifest!A2:B',
		});

		const rows = res.data.values;
		if(rows === undefined) {
			throw new Error();
		}
		return rows.map((row) => {
			const [
				key,
				value,
			] = row;

			return {
				[key]: value,
			};
		}).reduce((a, b) => {
			return {
				...a,
				...b,
			};
		}, {}) as Manifest;
	}

	public async getAccounts(): Promise<{
		[key: string]: Account;
	}> {
		const res = await this.sheets.spreadsheets.values.get({
			'spreadsheetId': this.id,
			'range': 'accounts!A2:E',
		});

		const rows = res.data.values;
		if(rows === undefined) {
			return {};
		}
		return rows.map((row) => {
			const [
				id,
				screen_name,
				name,
				created_at,
				crawled_at,
			] = row;

			return {
				'id': this.id,
				'screen_name': screen_name,
				'name': name,
				'created_at': created_at,
				'crawled_at': crawled_at,
			};
		}).reduce((a, b) => {
			return {
				...a,
				[b.id]: b,
			};
		}, {});
	}

	public async setAccounts(ids: string[]) {
		const accounts = await this.getAccounts();

		const filteredIds = ids.filter((id) => {
			return accounts[id] === undefined;
		});

		await this.sheets.spreadsheets.values.append({
			'spreadsheetId': this.id,
			'range': 'accounts!A2:E',
			'valueInputOption': 'RAW',
			'resource': {
				'values': filteredIds.map((id) => {
					return [
						id,
					];
				}),
			},
		} as any, {});
	}
}
