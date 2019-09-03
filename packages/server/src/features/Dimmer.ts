import _ from "lodash";
import moment from "moment";
import Config from "@/lib/Config";
import Shutdown from "@/lib/Shutdown";
import Logger from "@/lib/Logger";
import DataStore from "@/lib/DataStore";
import DimmerScheduler from "@/features/DimmerScheduler";
import PCA9685 from "@/hardware/PCA9685";

interface ChannelSettings {
    name: string;
    channel: number;
    percentage: number;
    brightness: number;
};

export default class Dimmer {
    private static _lastUpdateTimestamp = moment("1975-11-23T00:00:00.000Z");
    private static _pwm = new PCA9685(0x40, 1000);

    public static async init(): Promise<void> {
        Logger.info("Connecting to dimmer");

        try {
            await this._saveDimmerLevels([]);

            Shutdown.register(async () => {
                await this._pwm.allChannelsOff();
            });

            Logger.info("Connected to dimmer");
        } catch (err) {
            Logger.throw("Could not connect to the lights", {
                err
            });
        }
    }

    public static async update(): Promise<void> {
        const now = moment();
        if (now.diff(this._lastUpdateTimestamp, "seconds") < 15) {
            return;
        }

        this._lastUpdateTimestamp = now;
        const colorBrightnesses = await DimmerScheduler.getColorBrightnesses();
        await this._setColorBrightnesses(colorBrightnesses);
    }

    private static async _setColorBrightnesses(colorBrightnesses: object): Promise<void> {
        const channelSettings = _.flatMap(colorBrightnesses, (brightness, color) => {
            const channels = _.pickBy(Config.ledChannels, (_channel, name) => {
                return name.startsWith(color);
            });

            return _.map(channels, (channel: number, name: string) => {
                const percentage = _.round(brightness * 100, 2);
                const compensatedBrightness = _.round(Math.max(1.0 / 4096, brightness ** 2), 4);

                return {
                    name,
                    channel,
                    percentage,
                    brightness: compensatedBrightness
                };
            });
        });

        await this._saveDimmerLevels(channelSettings);

        const promises = channelSettings.map(async (settings) => {
            try {
                await this._pwm.setDutyCycle(settings.channel, settings.brightness);
            } catch (err) {
                Logger.alert("Caught an error setting dimmer channel level", {
                    err,
                    settings
                });
            }
        });

        await Promise.all(promises);
    }

    private static async _saveDimmerLevels(channelSettings: ChannelSettings[]): Promise<void> {
        const pairs = _.map(channelSettings, settings => {
            return [
                settings.name,
                _.pick(settings, ["channel", "percentage", "brightness"])
            ];
        });

        const dimmerLevels = _.fromPairs(pairs);

        await DataStore.set("dimmerLevels", {
            timestamp: moment().toISOString(),
            dimmerLevels
        });
    }
};
