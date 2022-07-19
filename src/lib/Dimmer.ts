import moment from "moment";
import Config from "$lib/Config";
import * as Shutdown from "$lib/Shutdown";
import * as DimmerScheduler from "$lib/DimmerScheduler";
import * as PCA9685 from "$lib/PCA9685";

let lastUpdateTimestamp = moment("1975-11-23T00:00:00.000Z");
PCA9685.init(0x40, 1000);

export async function init() {
    console.info("Connecting to dimmer");

    try {
        Shutdown.register(async () => {
            await PCA9685.allChannelsOff();
        });

        console.info("Connected to dimmer");
    } catch (err) {
        console.error("Could not connect to the lights");
        throw err;
    }
}

export async function update() {
    const now = moment();
    if (now.diff(lastUpdateTimestamp, "seconds") < 15) {
        return;
    }

    lastUpdateTimestamp = now;
    const colorBrightnesses = await DimmerScheduler.getColorBrightnesses();
    await setColorBrightnesses(colorBrightnesses);
}

type ChannelSettings = {
    name: string,
    channel: number,
    percentage: number, 
    brightness: number
};

async function setColorBrightnesses(colorBrightnesses: DimmerScheduler.ColorBrightnesses) {
    const channelSettings: ChannelSettings[] = [];
    for (const [color, brightness] of Object.entries(colorBrightnesses)) {
        for (const [name, channel] of Object.entries(Config.ledChannels)) {
            if (name.startsWith(color)) {
                const percentage = brightness * 100;
                const compensatedBrightness = Math.max(1.0 / 4096, brightness ** 2);

                channelSettings.push({
                    name,
                    channel,
                    percentage,
                    brightness: compensatedBrightness
                });
            }
        }
    }

    const promises = channelSettings.map(async (settings) => {
        try {
            await PCA9685.setDutyCycle(settings.channel, settings.brightness);
        } catch (err) {
            console.error("Caught an error setting dimmer channel level");
            throw err;
        }
    });

    await Promise.all(promises);
}
