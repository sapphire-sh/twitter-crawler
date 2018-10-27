import {
	App,
} from './App';

try {
	(async () => {
		const app = new App();
		await app.initialize();
		await app.start();
	})();
}
catch(err) {
	console.log(err);
}
