const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: `./src/DataSourceHelper.ts`,
    output: {
        filename: `DataSourceHelper.js`,
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "umd"
    },
    resolve: {
        extensions: [ ".ts", ".js" ],
        alias: {
            "tests": path.resolve(__dirname, "./tests")
        }
    },
    module: {
        rules: [
            { test: /\.ts$/, use: "ts-loader" },
            {
                test: /\.scss$/,
                loader: "css-loader!sass-loader"
            },
            {
                test: /\.gif$/,
                use: [ {
                    loader: "url-loader",
                    options: { limit: 8192 }
                } ]
            }
        ]
    },
    devtool: "source-map",
    externals: [ /^mxui\/|^mendix\/|^dojo\/|^dijit\// ],
    plugins: [
        new webpack.LoaderOptionsPlugin({ debug: true })
    ]
};
