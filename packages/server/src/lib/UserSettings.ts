import _ from "lodash";
import { promises as fsPromises } from "fs";
import { dirname, join } from "path";
import { accessSync } from "fs";
import moment from "moment";
import Logger from "@/lib/Logger";

export default class UserSettings {
    private static _data: any;
    private static _timestamp = moment("1975-11-23T00:00:00.000Z");

    public static async get(path: string): Promise<any> {
        await this._load();

        return _.get(this._data, path);
    }

    private static async _load(): Promise<void> {
        await this._createIfMissing();
        await this._loadIfChanged();
    }

    private static async _createIfMissing(): Promise<void> {
        try {
            this._findFile("userSettings.json");
        } catch (err) {
            const defaultPath = this._findFile("defaultUserSettings.json");
            const userSettingsPath = join(dirname(defaultPath), "userSettings.json");
            const defaultUserSettings = await this._loadJSON(defaultPath);
            await fsPromises.writeFile(userSettingsPath, JSON.stringify(defaultUserSettings, null, 4));
        }
    }

    private static async _loadIfChanged(): Promise<void> {
        const path = this._findFile("userSettings.json");
        const stats = await fsPromises.stat(path);
        if (this._timestamp.isAfter(stats.mtime)) {
            return;
        }

        this._timestamp = moment();

        Logger.info("Loading settings");
        this._data = await this._loadJSON(path);
        Logger.info("Loaded settings");
    }

    private static async _loadJSON(path: string): Promise<any> {
        const json = await fsPromises.readFile(path, "utf-8");

        return JSON.parse(json);
    }

    private static _findFile(filename: string): string {
        let directory = __dirname;

        while (directory !== "/") {
            const filePath = join(directory, filename);
            try {
                accessSync(filePath);

                return filePath;
            } catch (err) {
                // Ignore
            }

            directory = dirname(directory);
        }

        throw new Error(`Could not find ${filename}`);
    }
};
