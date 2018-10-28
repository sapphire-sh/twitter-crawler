import {
	google,
	sheets_v4,
} from 'googleapis';

import {
	OAuth2Client,
} from 'google-auth-library';

import {
	Processor,
} from '../libs/Processor';

import {
	Command,
	Manifest,
	Sheet,
	Coordinates,
	User,
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

	private async getSheetData(range: string) {
		const res = await this.sheets.spreadsheets.values.get({
			'spreadsheetId': this.sheetID,
			'range': range,
		});
		return res.data;
	}

	private async getSheetSchema(sheetName: string) {
		return this.getSheetData(`${sheetName}!1:1`);
	}

	private async getSheet<T extends object>(range: string): Promise<Sheet<T>> {
		const sheetName = range.split('!')[0];

		const schema = await this.getSheetSchema(sheetName);
		const data = await this.getSheetData(range);

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
		const [
			manifest,
		] = sheet.data;
		return manifest;
	}

	public async getUsers(): Promise<Sheet<any>> {
		return this.getSheet<any>('users!A2:H');
	}

	public async appendUsers(ids: string[]): Promise<void> {
		const sheet = await this.getUsers();

		const values = ids.filter((id) => {
			const user = sheet.find((user) => {
				return user.id === id;
			});
			return user === null;
		}).map((id) => {
			return [
				id,
			];
		});

		await this.appendSheet('users!A2:H', values);
	}

	public async updateUser(coordinates: Coordinates, user: User): Promise<void> {
		const values = [
			[
				JSON.stringify(user),
				user.screen_name,
				user.name,
				user.created_at,
				(new Date()).toLocaleString(),
			],
		];
		await this.updateSheet(`users!C${coordinates.y}:G${coordinates.y}`, values);
	}
}
