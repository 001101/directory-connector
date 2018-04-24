const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GoogleFontsPlugin = require("google-fonts-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;

const isVendorModule = (module) => {
    if (!module.context) {
        return false;
    }
    return module.context.indexOf('node_modules') !== -1;
};

const extractCss = new ExtractTextPlugin({
    filename: '[name].css',
    disable: false,
    allChunks: true
});

const common = {
    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader'
            },
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                exclude: /.*(fontawesome-webfont)\.svg/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'images/',
                    }
                }]
            }
        ]
    },
    plugins: [],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            jslib: path.join(__dirname, 'jslib/src')
        },
        symlinks: false,
        modules: [path.resolve('node_modules')]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build')
    }
};

const renderer = {
    target: 'electron-renderer',
    node: {
        __dirname: false
    },
    entry: {
        'app/main': './src/app/main.ts'
    },
    module: {
        rules: [
            {
                test: /\.(html)$/,
                loader: 'html-loader'
            },
            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                exclude: /loading.svg/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/',
                        publicPath: '../'
                    }
                }]
            },
            {
                test: /\.scss$/,
                use: extractCss.extract({
                    use: [
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'sass-loader',
                        }
                    ],
                    publicPath: '../'
                })
            },
        ]
    },
    plugins: [
        new GoogleFontsPlugin({
            fonts: [
                {
                    family: 'Open Sans',
                    variants: ['300', '300italic', '400', '400italic', '600', '600italic',
                        '700', '700italic', '800', '800italic'],
                    subsets: ['cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'latin', 'latin-ext']
                }
            ],
            formats: ['woff2'],
            path: 'fonts/',
            filename: 'css/fonts.css'
        }),
        new AngularCompilerPlugin({
            tsConfigPath: 'tsconfig.json',
            entryModule: 'src/app/app.module#AppModule',
            sourceMap: true
        }),
        // ref: https://github.com/angular/angular/issues/20357
        new webpack.ContextReplacementPlugin(/\@angular(\\|\/)core(\\|\/)esm5/,
            path.resolve(__dirname, './src')),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'app/vendor',
            chunks: ['app/main'],
            minChunks: isVendorModule
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            chunks: ['app/vendor', 'app/main']
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map',
            include: ['app/main.js']
        }),
        extractCss
    ]
};

module.exports = merge(common, renderer);
