const path = require('path');
const CleanWebPackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
        mode: 'development',
        entry: './src/carousa11y.es6.js',
        devtool: 'cheap-source-map',
        devServer: {
            contentBase: './dist',
            publicPath: '/assets/',
        },
        output: {
            filename: 'carousa11y.min.js',
            path: path.resolve(__dirname, 'dist'),
            library: 'Carousa11y',
            libraryExport: 'default'
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader'
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,//devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true
                            }
                        }, {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new CleanWebPackPlugin(['dist'], {exclude: 'index.html'}),
            new MiniCssExtractPlugin({
                filename: 'carousa11y.css',
            })
        ]
};