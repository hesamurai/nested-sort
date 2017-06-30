var webpack = require('webpack');
var path = require('path');

var config = {
    entry: __dirname + '/src/nested-sort.js',
    devtool: 'source-map',
    output: {
        path: __dirname + '/dist',
        filename: 'nested-sort.js',
        library: 'nestedSort',
        libraryTarget: 'var'
    },
    module: {
        loaders: [
            {
                test: /(\.jsx|\.js)$/,
                loader: 'babel',
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /(\.jsx|\.js)$/,
                loader: "eslint-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        root: path.resolve('./src'),
        extensions: ['', '.js']
    }
};

module.exports = config;
