import fs from 'fs';
import path from 'path';

import request from 'request';

export async function download(name: string, url: string) {
	const filename = url.split('/').pop()!.split(':').shift()!;
	const artistPath = path.resolve(__directories.data_dir, name.replace(/\//g, '_'));
	try {
		await fs.statSync(artistPath);
	}
	catch(err) {
		await fs.mkdirSync(artistPath);
	}
	const filePath = path.resolve(artistPath, filename);

	return new Promise((resolve, reject) => {
		request.head(url, (err) => {
			if(err) {
				reject(err);
			}
			const stream = fs.createWriteStream(filePath);
			request(url).pipe(stream).on('close', resolve);
		});
	});
}
