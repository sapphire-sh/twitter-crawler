import path from 'path';

import {
	GoogleAuth,
	GoogleDrive,
	GoogleSpreadsheet,
	Twitter,
} from './libs';

import {
	CredentialsType,
	Manifest,
} from './models';

const DRIVE_ID = '1LBftZfGtRYSfNF0azqN3t0u1dNPy05ta';
const SHEETS_ID = '1u8gCPBQB_iWFN-bYJzRBOhOUQ6krwNG51GI_kEKQfCc';

(async () => {
	try {
		{
			const googleAuth = new GoogleAuth<CredentialsType.SPREADSHEETS>(CredentialsType.SPREADSHEETS);
			const auth = await googleAuth.initialize();
			if(auth === null) {
				return;
			}
			GoogleSpreadsheet.createInstance(auth, SHEETS_ID);
		}

		{
			const manifest = await GoogleSpreadsheet.getInstance().getManifest();
			Twitter.createInstance(manifest);
		}

		{
			const accounts = await Twitter.getInstance().getFollowings();
			GoogleSpreadsheet.getInstance().setAccounts(accounts);
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
	catch(err) {
		console.log(err);
	}
})();
