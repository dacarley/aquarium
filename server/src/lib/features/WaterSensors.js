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
    _standardDeviation,

    _waterLevels: {
        sump: {
            values: [],
            runningAverage: 0,
            standardDeviation: 0
        },
        reservoir: {
            values: [],
            runningAverage: 0,
            standardDeviation: 0
        }
    }
};

function init() {
    Logger.info("Initializing AutoTopOff");
    ADS1x15.connect();
}

async function readWaterLevels() {
    const vIn = await ADS1x15.readSingle(Config.waterSensors.a2d.vIn, 6144, 64);
    await this._readWaterSensor("sump", vIn);
    await this._readWaterSensor("reservoir", vIn);

    return {
        sump: this._waterLevels.sump.runningAverage,
        reservoir: this._waterLevels.reservoir.runningAverage
    };
}

async function _readWaterSensor(sensor, vIn) {
    const inches = await this._readRawWaterSensor(sensor, vIn);
    const sensorLevels = this._waterLevels[sensor];

    if (sensorLevels.values.length >= Config.waterSensors.minStabilityReadings) {
        const diff = Math.abs(inches - sensorLevels.runningAverage);
        if (diff > Config.waterSensors.maxChange && diff > sensorLevels.standardDeviation) {
            Logger.info(`Discarding out-of-range value for ${sensor}.`, {
                inches,
                sensorLevels
            });

            return;
        }

        sensorLevels.values.shift();
    }

    sensorLevels.values.push(inches);
    sensorLevels.runningAverage = _.mean(sensorLevels.values);
    sensorLevels.standardDeviation = this._standardDeviation(sensorLevels.values);
}

function _standardDeviation(data) {
    const mean = _.mean(data);
    const sumOfSquares = _.sumBy(data, value => (value - mean) ** 2);

    return Math.sqrt(sumOfSquares / data.length);
}

async function _readRawWaterSensor(sensor, vIn) {
    const channel = Config.waterSensors.a2d[sensor];
    const vSense = await ADS1x15.readSingle(channel, 4096, 64);
    const vDiff = vSense / vIn;
    const rRef = 1000;
    const rSense = (vDiff * rRef) / (1 - vDiff);
    const rZero = 400;
    const rDiff = rSense - rZero;
    const inches = 12 - (rDiff / 150);

    return _.round(inches, 2);
}
