const path = require('path');

const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const env = process.env.NODE_ENV === 'development' ? 'development' : 'production';

module.exports = {
	'entry': path.resolve(__dirname, 'src', 'index.ts'),
	'output': {
		'path': path.resolve(__dirname, 'dist'),
		'filename': 'main.js',
	},
	'module': {
		'rules': [
			{
				'test': /\.tsx?$/,
				'use': [
					'ts-loader',
				],
			},
		],
	},
    'devtool': false,
	'resolve': {
		'extensions': [
			'.ts',
			'.tsx',
			'.js',
			'.json',
		],
	},
	'plugins': [
		new webpack.DefinePlugin({
			'__dev': process.env.NODE_ENV === 'development',
			'__test': process.env.NODE_ENV === 'test',
			// '__env': (() => {
			// 	const data = fs.readFileSync(envPath);
			// 	return JSON.stringify(data.toString().trim().split('\n').map((e) => {
			// 		const t = e.split('=');
			// 		return {
			// 			[t[0]]: t[1],
			// 		};
			// 	}).reduce((a, b) => {
			// 		return {
			// 			...a,
			// 			...b,
			// 		};
			// 	}));
			// })(),
		}),
		new webpack.ProgressPlugin(),
	],
	'mode': env,
	'target': 'node',
	'node': {
		'__dirname': true,
	},
	'externals': [
		nodeExternals(),
	],
};
