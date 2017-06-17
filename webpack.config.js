const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const root = require("root-path");
const providesModuleHelper = require("./providesModuleHelper.js");

const nodeModules = _.filter(fs.readdirSync("node_modules"), dir => dir !== ".bin");

module.exports = {
    target: "node",
    entry: "./server/src/index.js",
    output: {
        path: path.join(__dirname, "build"),
        filename: "aquarium.js"
    },
    node: {
        __dirname: false,
        __filename: false
    },
    externals: (_context, request, cb) => {
        if (_.includes(nodeModules, request)) {
            cb(null, `commonjs ${request}`);

            return;
        }

        cb();
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
