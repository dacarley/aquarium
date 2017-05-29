const webpack = require("webpack");
const path = require("path");
const root = require("root-path");
const providesModuleHelper = require("./providesModuleHelper.js");

module.exports = {
    target: "node",
    entry: "./server/src/index.js",
    output: {
        path: path.join(__dirname, "build"),
        filename: "index.js"
    },
    node: {
        __dirname: false,
        __filename: false
    },
    resolve: {
        alias: providesModuleHelper.discover({
            roots: [
                root("server/src")
            ]
        }),
        extensions: [".js", ".json"]
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: [/node_modules/],
                query: {
                    presets: ["es2015", "stage-0"],
                    cacheDirectory: true,
                    plugins: ["transform-runtime"]
                }
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            }
        ]
    }
};
