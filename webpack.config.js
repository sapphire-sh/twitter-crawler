const path = require('path');

const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

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
	},
	'plugins': [
		new webpack.DefinePlugin({
			'__dev': process.env.NODE_ENV === 'development',
			'__test': process.env.NODE_ENV === 'test',
		}),
		new webpack.ProgressPlugin(),
	],
	'mode': env,
}

module.exports = [
	{
		...config,
		'entry': path.resolve(__dirname, 'src/client', 'index.tsx'),
		'output': {
			'path': path.resolve(__dirname, 'dist/assets'),
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
		'entry': path.resolve(__dirname, 'src/server', 'index.ts'),
		'output': {
			'path': path.resolve(__dirname, 'dist'),
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
