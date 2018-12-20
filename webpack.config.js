const path = require('path');

const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const rootDir = path.resolve(__dirname);
const srcDir = path.resolve(rootDir, './src');
const distDir = path.resolve(rootDir, './dist');
const clientDir = path.resolve(srcDir, './client');
const serverDir = path.resolve(srcDir, './server');
const sharedDir = path.resolve(srcDir, './shared');
const credentialsDir = path.resolve(rootDir, './credentials');
const tokensDir = path.resolve(rootDir, './tokens');
const dataDir = path.resolve(rootDir, './data');

const config = {
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
	'devtool': 'source-map',
	'resolve': {
		'extensions': [
			'.ts',
			'.tsx',
			'.js',
			'.json',
		],
		'alias': {
			'~/client': clientDir,
			'~/server': serverDir,
			'~/shared': sharedDir,
		},
	},
	'plugins': [
		new webpack.DefinePlugin({
			'__dev': process.env.NODE_ENV === 'development',
			'__test': process.env.NODE_ENV === 'test',
			'__directories': JSON.stringify({
				'root_dir': rootDir,
				'src_dir': srcDir,
				'dist_dir': distDir,
				'client_dir': clientDir,
				'server_dir': serverDir,
				'shared_dir': sharedDir,
				'credentials_dir': credentialsDir,
				'tokens_dir': tokensDir,
				'data_dir': dataDir,
			}),
		}),
		new webpack.ProgressPlugin(),
	],
	'mode': env,
}

module.exports = [
	{
		...config,
		'entry': path.resolve(clientDir, 'index.tsx'),
		'output': {
			'path': path.resolve(distDir, './assets'),
			'publicPath': '/assets',
			'filename': 'main.js',
		},
		'module': {
			...config.module,
			'rules': [
				...config.module.rules,
				{
					'test': /\.html$/,
					'use': {
						'loader': 'file-loader',
						'options': {
							'name': '[name].[ext]',
						},
					},
				},
			],
		},
	},
	{
		...config,
		'entry': path.resolve(serverDir, 'index.ts'),
		'output': {
			'path': distDir,
			'filename': 'main.js',
		},
		'target': 'node',
		'node': {
			'__dirname': true,
		},
		'externals': [
			nodeExternals(),
		],
	},
];
