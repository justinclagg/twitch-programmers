const webpack = require('webpack');
var Dotenv = require('dotenv-webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const SRC_DIR = path.resolve(__dirname, './src');

module.exports = {
	entry: SRC_DIR + '/index.js',
	output: {
		path: path.resolve(__dirname),
		filename: './js/app.js',
		publicPath: '/'
	},
	plugins: [
		new Dotenv({
			path: './.env',
			safe: false
		}),
		new ExtractTextPlugin('./css/[name].css')
	],
	module: {
		loaders: [
			{
				test: /\.js$/,
				include: SRC_DIR,
				loader: 'babel-loader',
				query: {
					presets: ['es2015'],
				}
			},
			{
				test: /\.css$/,
				include: SRC_DIR,
				loader: ExtractTextPlugin.extract(
					'style',
					'css'
				) 
			}
		]
	}
};