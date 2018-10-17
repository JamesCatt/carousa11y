const merge = require('webpack-merge');
const common = require('./webpack.common');
//const devMode = process.env.NODE_ENV !== 'production';

module.exports = merge(common, {
        mode: 'development',
        devtool: 'cheap-source-map',
        devServer: {
            contentBase: './test',
            publicPath: '/assets/',
        }
});