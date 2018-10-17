const merge = require('webpack-merge');
const common = require('./webpack.common');
/*const path = require('path');
const CleanWebPackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== 'production';*/

module.exports = merge(common, {
        mode: 'production',
        devtool: 'source-map',
});