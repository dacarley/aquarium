import { promises as fsPromises } from "fs";
import { dirname, join } from "path";
import { accessSync } from "fs";
import moment from "moment";

let data: any;
let timestamp = moment("1975-11-23T00:00:00.000Z");

export async function getValue(path: string): Promise<any> {
    await load();

    return data[path];
}

async function load() {
    await createIfMissing();
    await loadIfChanged();
}

async function createIfMissing() {
    try {
        findFile("userSettings.json");
    } catch (err) {
        const defaultPath = findFile("defaultUserSettings.json");
        const userSettingsPath = join(dirname(defaultPath), "userSettings.json");
        const defaultUserSettings = await loadJSON(defaultPath);
        await fsPromises.writeFile(userSettingsPath, JSON.stringify(defaultUserSettings, null, 4));
    }
}

async function loadIfChanged() {
    const path = findFile("userSettings.json");
    const stats = await fsPromises.stat(path);
    if (timestamp.isAfter(stats.mtime)) {
        return;
    }

    timestamp = moment();

    console.info("Loading settings");
    data = await loadJSON(path);
    console.info("Loaded settings");
}

async function loadJSON(path: string) {
    const json = await fsPromises.readFile(path, "utf-8");

    return JSON.parse(json);
}

function findFile(filename: string) {
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