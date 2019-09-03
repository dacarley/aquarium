import _ from "lodash";
import Config from "@/lib/Config";
import ADS1x15 from "@/hardware/ADS1x15";

export interface WaterLevels {
    sump: number;
    reservoir: number;
}

export interface WaterDetails {
    sump: {
        values: number[];
        runningAverage: number;
    };

    reservoir: {
        values: number[];
        runningAverage: number;
    };
}

export default class WaterSensors {
    private static _waterLevels = {
        sump: {
            values: [],
            runningAverage: 0
        },
        reservoir: {
            values: [],
            runningAverage: 0
        }
    } as WaterDetails;

    public static async readWaterLevels(): Promise<WaterLevels> {
        try {
            const vIn = await ADS1x15.readSingle(Config.waterSensors.a2d.vIn, 6144, 64);
            await this._readWaterSensor("sump", vIn);
            await this._readWaterSensor("reservoir", vIn);
        } catch (err) {
            // Ignore
        }

        return {
            sump: this._waterLevels.sump.runningAverage,
            reservoir: this._waterLevels.reservoir.runningAverage
        };
    }

    private static async _readWaterSensor(sensor: "sump" | "reservoir", vIn: number): Promise<void> {
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
            // Ignore
        }
    }

    private static async _readRawWaterSensor(sensor: "sump" | "reservoir", vIn: number): Promise<number> {
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
};
