import i2cBus from "i2c-bus";
import { Pca9685Driver } from "pca9685";
import Logger from "@/lib/Logger";

export default class PCA9685 {
    private _driver: Pca9685Driver | undefined;

    constructor(address: number, frequency: number) {
        const options = {
            i2c: i2cBus.openSync(1),
            address,
            frequency,
            debug: false
        };

        this._driver = new Pca9685Driver(options, err => {
            if (err) {
                Logger.error("Error from the pca9685 constructor callback!", {
                    err
                });

                this._driver = undefined;
            }
        });
    }

    public allChannelsOff(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this._driver) {
                return reject(new Error("No connection to the pca9685"));
            }

            this._driver.allChannelsOff(err => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }

    public setDutyCycle(channel: number, duty: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this._driver) {
                return reject(new Error("No connection to the pca9685"));
            }

            this._driver.setDutyCycle(channel, duty, 0, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }
}
