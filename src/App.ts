import {
	GoogleAuth,
	GoogleDrive,
	GoogleSpreadsheet,
	Twitter,
} from './libs';

import {
	CredentialsType,
} from './models';

const DRIVE_ID = '1LBftZfGtRYSfNF0azqN3t0u1dNPy05ta';
const SHEETS_ID = '1u8gCPBQB_iWFN-bYJzRBOhOUQ6krwNG51GI_kEKQfCc';

export class App {
	public async initialize() {
		{
			const googleAuth = new GoogleAuth(CredentialsType.SPREADSHEETS);
			const auth = await googleAuth.initialize();
			if(auth === null) {
				return;
			}
			GoogleSpreadsheet.createInstance(auth, SHEETS_ID);
		}

		// {
		// 	const googleAuth = new GoogleAuth(CredentialsType.DRIVE);
		// 	const auth = await googleAuth.initialize();
		// 	if(auth === null) {
		// 		return;
		// 	}
		// 	GoogleDrive.createInstance(auth, DRIVE_ID);
		// }

		// {
		// 	const manifest = await GoogleSpreadsheet.getInstance().getManifest();
		// 	Twitter.createInstance(manifest);
		// }
	}

	public async start() {
		{
			const manifest = await GoogleSpreadsheet.getInstance().getManifest();
			console.log(manifest);
			// GoogleSpreadsheet.getInstance().getUsers();
			// const accounts = await Twitter.getInstance().getFollowings();
			// GoogleSpreadsheet.getInstance().setAccounts(accounts);
		}

		{
			// await Twitter.getInstance().getRateLimitStatus();
		}

		{
			// await Twitter.getInstance().getUser('1041275214821187587');
		}

		// {
		// 	const googleAuth = new GoogleAuth<CredentialsType.DRIVE>(CredentialsType.DRIVE);
		// 	const auth = await googleAuth.initialize();
		// 	if(auth === null) {
		// 		return;
		// 	}
		// 	const googleDrive = new GoogleDrive(auth, DRIVE_ID);

		// 	let directories = await googleDrive.getDirectories('root');
		// 	directories = directories.filter((directory) => {
		// 		return directory.name === 'twitter-crawler';
		// 	});
		// 	if(directories.length === 1) {
		// 		console.log(directories.pop());
		// 	}
		// }
	}
}
