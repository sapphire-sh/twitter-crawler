import {
	App,
} from './App';

try {
	(async () => {
		App.createInstance();
		const app = App.getInstance();
		await app.initialize();
		app.start();
	})();
}
catch(err) {
	console.log(err);
}
