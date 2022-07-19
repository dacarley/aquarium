import i2cBus from "i2c-bus";
import { Pca9685Driver } from "pca9685";
import { delay } from "$lib/delay";

let driver: Pca9685Driver | undefined;

export function init(address: number, frequency: number) {
    const options = {
        i2c: i2cBus.openSync(1),
        address,
        frequency,
        debug: false
    };

    driver = new Pca9685Driver(options, err => {
        if (err) {
            console.error("Error from the pca9685 constructor callback!", {
                err
            });

            driver = undefined;
        }
    });
}

export function allChannelsOff() {
    return new Promise((resolve, reject) => {
        console.info("Dimmer: Shutting down...");
        if (!driver) {
            return reject(new Error("No connection to the pca9685"));
        }

        console.info("Dimmer: Turning all channels off...");
        driver.allChannelsOff(async err => {
            if (err) {
                return reject(err);
            }

            await delay(5000);

            console.info("Dimmer: Done");
            resolve(undefined);
        });
    });
}

export function setDutyCycle(channel: number, duty: number) {
    return new Promise((resolve, reject) => {
        if (!driver) {
            return reject(new Error("No connection to the pca9685"));
        }

        driver.setDutyCycle(channel, duty, 0, (err) => {
            if (err) {
                return reject(err);
            }

            resolve(undefined);
        });
    });
}
