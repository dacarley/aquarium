// @providesModule AQ-UserSettings

import _ from "lodash";
import moment from "moment";
import root from "root-path";
import AsyncFile from "AQ-AsyncFile";

export default {
    get,

    _load,
    _loadJson,

    _cache: {
        modificationTime: "1975-11-23T00:00:00.000Z"
    }
};

async function get(path) {
    const userSettings = await this._load();

    return _.get(userSettings, path);
}

async function _load() {
    const path = root("userSettings.json");
    const stats = await AsyncFile.stat(path);

    const exists = await AsyncFile.exists(path);
    if (!exists) {
        const defaultPath = root("defaultUserSettings.json");
        const defaultUserSettings = await this._loadJson(defaultPath);
        await AsyncFile.writeFile(path, JSON.stringify(defaultUserSettings, null, 4));
    }

    const modificationTime = moment(stats.mtime);
    if (modificationTime.isAfter(this._cache.modificationTime)) {
        this._cache.data = await this._loadJson(path);
    }

    return this._cache.data;
}

async function _loadJson(path) {
    const json = await AsyncFile.readFile(path, "utf-8");

    return JSON.parse(json);
}
