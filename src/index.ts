import {
	App,
} from './App';

try {
	(async () => {
		const app = new App();
		await app.initialize();
		app.start();
	})();
}
catch(err) {
	console.log(err);
}
