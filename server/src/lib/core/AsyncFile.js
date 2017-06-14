// @providesModule AQ-AsyncFile

import fs from "fs";
import mkdirp from "mkdirp";
import Promisify from "AQ-Promisify";

export default {
    exists,
    stat: Promisify(fs.stat, fs),
    readFile: Promisify(fs.readFile, fs),
    writeFile: Promisify(fs.writeFile, fs),
    readDir: Promisify(fs.readdir, fs),
    mkdir: Promisify(mkdirp),
    chmod: Promisify(fs.chmod, fs)
};

async function exists(file) {
    try {
        await this.stat(file);

        return true;
    } catch (err) {
        return false;
    }
}
