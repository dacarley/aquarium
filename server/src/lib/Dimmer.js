// @providesModule AQ-Dimmer

import _ from "lodash";
import i2cBus from "i2c-bus";
import { Pca9685Driver } from "pca9685";
import Promisify from "AQ-Promisify";
import LedChannels from "AQ-LedChannels";
import PromiseHelper from "AQ-PromiseHelper";
import Logger from "AQ-Logger";

export default {
    connect,

    setColorBrightnesses
};

async function connect() {
    const options = {
        i2c: i2cBus.openSync(1),
        address: 0x40,
        frequency: 1000,
        debug: false
    };

    return new Promise((resolve, reject) => {
        this.pwm = new Pca9685Driver(options, (err) => {
            if (err) {
                return reject(new Error("Could not connect to 9685 on i2c"));
            }

            resolve();
        });
    });
}

async function setColorBrightnesses(colorBrightnesses) {
    const setDutyCycle = Promisify(this.pwm.setDutyCycle, this.pwm);

    const channelSettings = _.flatMap(colorBrightnesses, (brightness, color) => {
        return _(LedChannels)
            .pickBy((_channel, name) => name.startsWith(color))
            .map((channel, name) => ({
                name,
                channel,
                brightness
            }))
            .value();
    });

    await PromiseHelper.each(channelSettings, async (settings) => {
        const percentage = Math.round(settings.brightness * 100);

        Logger.info(`Setting ${settings.name} to ${percentage}% brightness`);

        await setDutyCycle(settings.channel, settings.brightness, 0);
    });
}
