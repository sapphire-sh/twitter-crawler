import {
	promises as fsPromises,
} from 'fs';
import readline from 'readline';
import path from 'path';

import {
	OAuth2Client,
} from 'google-auth-library';

import {
	CredentialsType,
} from '../models';

import {
	readJSON,
} from '../helpers';

const SCOPES = [
	'https://www.googleapis.com/auth/drive.metadata.readonly',
	'https://www.googleapis.com/auth/spreadsheets',
];

export class GoogleAuth<T extends CredentialsType> {
	private credentialsType: CredentialsType;
	private credentialsPath: string;
	private tokensPath: string;

	constructor(e: T) {
		this.credentialsType = e;
		const fileName = `${this.credentialsType}.json`;
		this.credentialsPath = path.resolve(__dirname, '../../../credentials', fileName);
		this.tokensPath = path.resolve(__dirname, '../../../tokens', fileName);
	}

	public async initialize(): Promise<OAuth2Client | null> {
		try {
			await fsPromises.lstat(this.tokensPath);
		}
		catch(err) {
			await fsPromises.mkdir(this.tokensPath);
		}

		try {
			const credentials = await readJSON(this.credentialsPath);
			return this.authorize(credentials);
		}
		catch(err) {
			console.log(err);
			return null;
		}
	}

	private async authorize(credentials: any): Promise<OAuth2Client | null> {
		const {
			client_secret,
			client_id,
			redirect_uris,
		} = credentials.installed;

		const client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

		try {
			const tokens = await readJSON(this.tokensPath);
			client.setCredentials(tokens);
			return client;
		}
		catch(err) {
			return this.getAccessToken(client);
		}
	}

	private async getAccessToken(client: OAuth2Client): Promise<OAuth2Client> {
		const url = client.generateAuthUrl({
			'access_type': 'offline',
			'scope': SCOPES,
		});
		console.log(`url: ${url}`);

		const rl = readline.createInterface({
			'input': process.stdin,
			'output': process.stdout,
		});

		const code = await new Promise<string>((resolve) => {
			rl.question('code: ', async (code) => {
				rl.close();
				resolve(code);
			});
		});

		const {
			tokens,
		} = await client.getToken(code);

		client.setCredentials(tokens);
		await fsPromises.writeFile(this.tokensPath, JSON.stringify(tokens));
		return client;
	}
}
