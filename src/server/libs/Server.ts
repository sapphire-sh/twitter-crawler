import http from 'http';
import path from 'path';

import Express from 'express';

export class Server {
	private static instance: Server | null = null;

	private server: http.Server;

	private constructor(port: number) {
		const app = Express();
		app.use('/', Express.static(path.resolve(__dirname, '../../../dist/assets')));

		this.server = app.listen(port, () => {
			console.log(`http://localhost:${port}`);
		});
	}

	public static createInstance(port: number = 8021) {
		if(this.instance !== null) {
			throw new Error('cannot create server instance');
		}
		this.instance = new Server(port);
	}

	public static getInstance(): Server {
		if(this.instance === null) {
			throw new Error('server instance is not created');
		}
		return this.instance;
	}
}
