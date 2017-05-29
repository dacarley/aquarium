const _ = require("lodash");
const fs = require("fs");
const resolvePath = require("path").resolve;

const blacklist = {
    __tests__: true,
    "react-packager": true,
    androidTest: true
};

const providesModulePattern = /@providesModule\s(\S+)/;

module.exports = {
    discover,

    _walkTree
};

function discover(options) {
    this.modules = {};

    console.log("Crawling File System");
    console.time("Crawling File System (Elapsed)");

    _.each(options.roots, path => this._walkTree(path));

    console.timeEnd("Crawling File System (Elapsed)");

    return this.modules;
}

function _walkTree(path) {
    const stat = fs.statSync(path);

    if (stat.isDirectory()) {
        const entries = fs.readdirSync(path);

        _.each(entries, entry => {
            if (!blacklist[entry]) {
                this._walkTree(resolvePath(path, entry));
            }
        });

        return;
    }

    if (!stat.isFile() || !path.endsWith(".js")) {
        return;
    }

    const content = fs.readFileSync(path, "utf-8");
    const parts = content.match(providesModulePattern);
    if (!parts) {
        return;
    }

    const moduleName = parts[1];
    const existingModulePath = this.modules[moduleName];
    if (existingModulePath && existingModulePath !== path) {
        const lines = [
            `Duplicated module ${moduleName}`,
            existingModulePath,
            path
        ];

        console.error(lines.join("\n"));

        return;
    }

    this.modules[moduleName] = path;
}
