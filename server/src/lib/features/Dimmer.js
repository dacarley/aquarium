// @providesModule AQ-Dimmer

import _ from "lodash";
import i2cBus from "i2c-bus";
import { Pca9685Driver } from "pca9685";
import Promisify from "AQ-Promisify";
import Config from "AQ-Config";
import PromiseHelper from "AQ-PromiseHelper";
import Shutdown from "AQ-Shutdown";
import Logger from "AQ-Logger";

export default {
    connect,
    disconnect,

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

            Shutdown.register(() => this.disconnect());

            Logger.info("Connected to dimmer");

            resolve();
        });
    });
}

async function disconnect() {
    const allChannelsOff = Promisify(this.pwm.allChannelsOff, this.pwm);
    await allChannelsOff();
    this.pwm = undefined;
}

async function setColorBrightnesses(colorBrightnesses) {
    if (!this.pwm) {
        throw new Error("The dimmer is not yet connected");
    }

    const setDutyCycle = Promisify(this.pwm.setDutyCycle, this.pwm);

    const channelSettings = _.flatMap(colorBrightnesses, (brightness, color) => {
        return _(Config.ledChannels)
            .pickBy((_channel, name) => name.startsWith(color))
            .map((channel, name) => ({
                name,
                channel,
                brightness
            }))
            .value();
    });

    await PromiseHelper.each(channelSettings, async (settings) => {
        const percentage = _.round(settings.brightness * 100, 2);

        Logger.info(`Setting ${settings.name} to ${percentage}% brightness`);

        await setDutyCycle(settings.channel, settings.brightness, 0);
    });
}
