// @providesModule AQ-Dimmer

import _ from "lodash";
import moment from "moment";
import i2cBus from "i2c-bus";
import { Pca9685Driver } from "pca9685";
import Promisify from "AQ-Promisify";
import Config from "AQ-Config";
import PromiseHelper from "AQ-PromiseHelper";
import Shutdown from "AQ-Shutdown";
import Logger from "AQ-Logger";
import DimmerScheduler from "AQ-DimmerScheduler";

export default {
    init,
    update,

    _disconnect,
    _setColorBrightnesses,

    _lastUpdateTimestamp: moment("1975-11-23T00:00:00.000Z")
};

async function init() {
    const options = {
        i2c: i2cBus.openSync(1),
        address: 0x40,
        frequency: 1000,
        debug: false
    };

    Logger.info("Connecting to dimmer");

    return new Promise((resolve, reject) => {
        this.pwm = new Pca9685Driver(options, (err) => {
            if (err) {
                return reject(new Error("Could not connect to 9685 on i2c"));
            }

            Shutdown.register(() => this._disconnect());

            Logger.info("Connected to dimmer");

            resolve();
        });
    });
}

async function _disconnect() {
    const allChannelsOff = Promisify(this.pwm.allChannelsOff, this.pwm);
    await allChannelsOff();
    this.pwm = undefined;
}

async function update() {
    const now = moment();
    if (now.diff(this._lastUpdateTimestamp, "seconds") < 15) {
        return;
    }

    this._lastUpdateTimestamp = now;
    const colorBrightnesses = await DimmerScheduler.getColorBrightnesses();
    await this._setColorBrightnesses(colorBrightnesses);
}

async function _setColorBrightnesses(colorBrightnesses) {
    if (!this.pwm) {
        Logger.throw("The dimmer is not yet connected");
    }

    const setDutyCycle = Promisify(this.pwm.setDutyCycle, this.pwm);

    const channelSettings = _.flatMap(colorBrightnesses, (brightness, color) => {
        return _(Config.ledChannels)
            .pickBy((_channel, name) => name.startsWith(color))
            .map((channel, name) => {
                const percentage = _.round(brightness * 100, 2);
                const compensatedBrightness = _.round(Math.max(1.0 / 4096, brightness ** 2), 4);

                return {
                    name,
                    channel,
                    percentage,
                    brightness: compensatedBrightness
                };
            })
            .value();
    });

    Logger.info("Setting channels", {
        channelSettings: _.map(channelSettings, settings => {
            return `${settings.name} (${settings.channel}): ${settings.percentage}% (${settings.brightness})`;
        })
    });

    await PromiseHelper.each(channelSettings, async (settings) => {
        await setDutyCycle(settings.channel, settings.brightness, 0);
    });
}
