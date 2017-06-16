// @providesModule AQ-UserSettings

import _ from "lodash";
import moment from "moment";
import root from "root-path";
import AsyncFile from "AQ-AsyncFile";
import Logger from "AQ-Logger";

export default {
    get,

    _load,
    _createIfMissing,
    _loadIfChanged,

    _data: undefined,
    _timestamp: moment("1975-11-23T00:00:00.000Z")
};

async function get(path) {
    const userSettings = await this._load();

    return _.get(userSettings, path);
}

async function _load() {
    await this._createIfMissing();
    await this._loadIfChanged();

    return this._data;
}

async function _createIfMissing() {
    const path = root("userSettings.json");
    const exists = await AsyncFile.exists(path);
    if (exists) {
        return;
    }

    const defaultPath = root("defaultUserSettings.json");
    const defaultUserSettings = await this._loadJson(defaultPath);
    await AsyncFile.writeFile(path, JSON.stringify(defaultUserSettings, null, 4));
}

async function _loadIfChanged() {
    const path = root("userSettings.json");
    const stats = await AsyncFile.stat(path);
    if (this._timestamp.isAfter(stats.mtime)) {
        return;
    }

    this._timestamp = moment();

    Logger.info("Loading settings");
    const json = await AsyncFile.readFile(path, "utf-8");
    this._data = JSON.parse(json);

    Logger.info("Loaded settings");
}
