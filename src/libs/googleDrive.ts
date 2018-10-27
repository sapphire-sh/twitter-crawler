import {
	google,
	drive_v3,
} from 'googleapis';

import {
	OAuth2Client,
} from 'google-auth-library';

export class GoogleDrive {
	private static instance: GoogleDrive | null = null;

	private auth: OAuth2Client;
	private id: string;
	private drive: drive_v3.Drive;

	private constructor(auth: OAuth2Client, id: string) {
		this.auth = auth;
		this.id = id;
		this.drive = google.drive({
			'version': 'v3',
			'auth': auth,
		});
	}

	public static createInstance(auth: OAuth2Client, id: string) {
		if(this.instance !== null) {
			throw new Error();
		}
		this.instance = new GoogleDrive(auth, id);
	}

	public static getInstance(): GoogleDrive {
		if(this.instance === null) {
			throw new Error();
		}
		return this.instance;
	}

	private async a(parents: string, isDirectory: boolean): Promise<drive_v3.Schema$File[]> {
		try {
			const res = await this.drive.files.list({
				'q': [
					`mimeType ${isDirectory ? '=' : '!='} 'application/vnd.google-apps.folder'`,
					`'${parents}' in parents`,
					`trashed = false`,
				].join(' and '),
			} as any);

			const {
				files,
			} = res.data;

			if(files === undefined) {
				console.log('cannot retrive files');
				return [];
			}
			if(files.length === 0) {
				console.log('no files found');
				return [];
			}

			return files;
		}
		catch(err) {
			console.log(err);
			return [];
		}
	}

	public getFiles(parents: string) {
		return this.a(parents, false);
	}

	public getDirectories(parents: string) {
		return this.a(parents, true);
	}
}
