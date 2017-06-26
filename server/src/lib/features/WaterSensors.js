// @providesModule AQ-WaterSensors

import _ from "lodash";
import Config from "AQ-Config";
import Logger from "AQ-Logger";
import ADS1x15 from "AQ-ADS1x15";

export default {
    init,
    readWaterLevels,

    _readWaterSensor,
    _readRawWaterSensor,

    _waterLevels: {
        sump: {
            values: [],
            runningAverage: 0
        },
        reservoir: {
            values: [],
            runningAverage: 0
        }
    }
};

function init() {
    Logger.info("Initializing AutoTopOff");
    ADS1x15.connect();
}

async function readWaterLevels() {
    try {
        const vIn = await ADS1x15.readSingle(Config.waterSensors.a2d.vIn, 6144, 64, "vIn");
        await this._readWaterSensor("sump", vIn);
        await this._readWaterSensor("reservoir", vIn);
    } catch (err) {
        Logger.alert("Caught an error updating water levels", {
            err
        });
    }

    return {
        sump: this._waterLevels.sump.runningAverage,
        reservoir: this._waterLevels.reservoir.runningAverage
    };
}

async function _readWaterSensor(sensor, vIn) {
    try {
        const inches = await this._readRawWaterSensor(sensor, vIn);
        const sensorLevels = this._waterLevels[sensor];

        if (sensorLevels.values.length >= Config.waterSensors.sampleWindowSize) {
            sensorLevels.values.shift();

            const diff = Math.abs(inches - sensorLevels.runningAverage);
            if (diff > (sensorLevels.runningAverage * 0.10)) {
                return;
            }
        }

        sensorLevels.values.push(inches);
        const mean = _.mean(sensorLevels.values);
        sensorLevels.runningAverage = _.round(mean, 2);
    } catch (err) {
        Logger.alert(`Caught an error reading ${sensor}`, err);
    }
}

async function _readRawWaterSensor(sensor, vIn) {
    const channel = Config.waterSensors.a2d[sensor];
    const vSense = await ADS1x15.readSingle(channel, 4096, 64, sensor);
    const vDiff = vSense / vIn;
    const rRef = 1000;
    const rSense = (vDiff * rRef) / (1 - vDiff);
    const rZero = 400;
    const rDiff = rSense - rZero;
    const inches = 12 - (rDiff / 150);

    return _.round(inches, 2);
}
