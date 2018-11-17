import {
	google,
	sheets_v4,
} from 'googleapis';

import {
	OAuth2Client,
} from 'google-auth-library';

import Twit from 'twit';

import {
	Processor,
} from '../libs/Processor';

import {
	UserEntity,
} from '../entities';

import {
	Command,
	Manifest,
	Sheet,
	Coordinates,
} from '../models';

export class GoogleSpreadsheets extends Processor {
	private static instance: GoogleSpreadsheets | null = null;

	private auth: OAuth2Client;
	private sheetID: string;
	private sheets: sheets_v4.Sheets;

	private constructor(auth: OAuth2Client, sheetID: string) {
		super();

		this.auth = auth;
		this.sheetID = sheetID;
		this.sheets = google.sheets({
			'version': 'v4',
			'auth': this.auth,
		});
	}

	public static createInstance(auth: OAuth2Client, sheetID: string) {
		if(this.instance !== null) {
			throw new Error('cannot create spreadsheets instance');
		}
		this.instance = new GoogleSpreadsheets(auth, sheetID);
	}

	public static getInstance(): GoogleSpreadsheets {
		if(this.instance === null) {
			throw new Error('spreadsheets instance is not created');
		}
		return this.instance;
	}

	private async createSheet(name: string) {
		return this.sheets.spreadsheets.batchUpdate({
			'spreadsheetId': this.sheetID,
			'resource': {
				'requests': [
					{
						'addSheet': {
							'properties': {
								'title': name,
							},
						},
					},
				],
			},
		} as any, {});
	}

	private async getSheetData(range: string) {
		try {
			const res = await this.sheets.spreadsheets.values.get({
				'spreadsheetId': this.sheetID,
				'range': range,
			});
			return res.data;
		}
		catch(err) {
			return null;
		}
	}

	private async getSheetSchema(sheetName: string) {
		return this.getSheetData(`${sheetName}!1:1`);
	}

	private async getSheet<T extends object>(range: string): Promise<Sheet<T> | null> {
		const sheetName = range.split('!')[0];

		const schema = await this.getSheetSchema(sheetName);
		const data = await this.getSheetData(range);

		if(schema === null) {
			return null;
		}
		if(data === null) {
			return null;
		}

		return new Sheet<T>(schema, data);
	}

	private async appendSheet(range: string, values: string[][]): Promise<void> {
		await this.sheets.spreadsheets.values.append({
			'spreadsheetId': this.sheetID,
			'range': range,
			'valueInputOption': 'RAW',
			'resource': {
				'values': values,
			},
		} as any, {});
	}

	private async updateSheet(range: string, values: string[][]): Promise<void> {
		await this.sheets.spreadsheets.values.update({
			'spreadsheetId': this.sheetID,
			'range': range,
			'valueInputOption': 'RAW',
			'resource': {
				'values': values,
			},
		} as any, {});
	}

	public async process(command: Command) {
		return;
	}

	public async getManifest(): Promise<Manifest> {
		const sheet = await this.getSheet<Manifest>('manifest!A2:2');
		if(sheet === null) {
			throw new Error('cannot find manifest sheet');
		}

		const [
			manifest,
		] = sheet.data;
		return manifest;
	}

	public async createUserSheet(name: string) {
		console.log(`create user sheet ${name}`);
		await this.createSheet(`@${name}`);

		const values = [
			[
				'id',
				'link',
				'data',
				'crawled_at',
			],
		];
		await this.updateSheet(`@${name}!A1:1`, values);
	}

	public async getUserSheet(name: string) {
		return this.getSheet<any>(`@${name}!A1:D`);
	}

	public async getUsers(): Promise<Sheet<{
		id: string;
		alias: string;
		name: string;
		screen_name: string;
	}> | null> {
		try {
			return this.getSheet<any>('users!A2:H');
		}
		catch(err) {
			console.log(err);
			return null;
		}
	}

	public async appendUsers(users: UserEntity[]): Promise<void> {
		const sheet = await this.getUsers();
		if(sheet === null) {
			return;
		}

		const values = users.map((user) => {
			return [
				user.id,
				'',
				user.name,
				user.screen_name,
			];
		});

		await this.appendSheet('users!A2:D', values);
	}

	public async updateUser(coordinates: Coordinates, user: Twit.Twitter.User): Promise<void> {
		const values = [
			[
				user.name,
				user.screen_name,
				(new Date()).toLocaleString(),
			],
		];
		await this.updateSheet(`users!C${coordinates.y}:D${coordinates.y}`, values);
	}

	public async updateUserFlag(coordinates: Coordinates): Promise<void> {
		const values = [
			[
				(new Date()).toLocaleString(),
			],
		];
		await this.updateSheet(`users!H${coordinates.y}:H${coordinates.y}`, values);
	}

	public async appendUserTweets(name: string, values: any[][]) {
		const sheet = await this.getUserSheet(name);
		if(sheet === null) {
			return;
		}

		await this.appendSheet(`@${name}!A2:D`, values);
	}
}
