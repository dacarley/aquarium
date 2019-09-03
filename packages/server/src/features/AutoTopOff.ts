import _ from "lodash";
import moment from "moment";
import Config from "@/lib/Config";
import Shutdown from "@/lib/Shutdown";
import Logger from "@/lib/Logger";
import UserSettings from "@/lib/UserSettings";
import DataStore from "@/lib/DataStore";
import WaterSensors from "@/features/WaterSensors";
import { Gpio, terminate } from "pigpio";

export default class AutoTopOff {
    private static _pumpOnTimestamp: string | undefined;
    private static _pumpOffTimestamp: string | undefined;
    private static _pump = new Gpio(Config.autoTopOff.pumpPin, {
        pullUpDown: Gpio.PUD_DOWN,
        mode: Gpio.OUTPUT
    });

    public static init(): void {
        this._turnPumpOff();
        this._pumpOffTimestamp = undefined;

        Shutdown.register(() => this._shutdown());
    }

    public static async update(): Promise<void> {
        const waterLevels = await WaterSensors.readWaterLevels();

        await DataStore.set("waterLevels", {
            timestamp: moment().toISOString(),
            waterLevels
        });

        /*
        if (waterLevels.reservoir < Config.autoTopOff.reservoir.min) {
            this._turnPumpOff();

            return;
        }

        if (waterLevels.reservoir < Config.autoTopOff.reservoir.alert) {
            Logger.alertHourly("The reservoir is getting low", {
                waterLevels
            });
        }
        */

        const isPumpOn = this._isPumpOn();
        const min = await UserSettings.get("autoTopOff.targetSumpLevel");
        const max = min + 0.25;

        if (isPumpOn && waterLevels.sump > max) {
            this._turnPumpOff();
            Logger.info("Sump is above its max, turned pump off.");
        }

        if (!isPumpOn && waterLevels.sump < min) {
            if (this._turnPumpOn()) {
                Logger.info("Sump is below its min, turned pump on.");
            }
        }

        this._enforceMaxPumpRuntime();
    }

    private static _shutdown(): void {
        this._turnPumpOff();

        terminate();
    }

    private static _isPumpOn(): boolean {
        return !_.isNil(this._pumpOnTimestamp);
    }

    private static _canTurnPumpOn(): boolean {
        if (this._isPumpOn()) {
            return false;
        }

        const timestamp = this._pumpOffTimestamp || "1975-11-23T00:00:00.000Z";
        const offSeconds = moment().diff(timestamp, "seconds");

        return offSeconds >= Config.autoTopOff.pumpCycleSeconds;
    }

    private static _turnPumpOn(): boolean {
        if (this._isPumpOn()) {
            return false;
        }

        if (!this._canTurnPumpOn()) {
            return false;
        }

        this._pumpOnTimestamp = moment().toISOString();
        this._pumpOffTimestamp = undefined;

        try {
            //this._pump.digitalWrite(1);

            return true;
        } catch (err) {
            Logger.throw("Caught an error while turning the pump on", {
                err
            });

            return false;
        }
    }

    private static _turnPumpOff(): void {
        try {
            this._pumpOnTimestamp = "";
            this._pumpOffTimestamp = moment().toISOString();
            this._pump.digitalWrite(0);
        } catch (err) {
            Logger.throw("Caught an error while turning the pump off", {
                err
            });
        }
    }

    private static _enforceMaxPumpRuntime(): void {
        if (!this._isPumpOn()) {
            return;
        }

        const pumpRunTimeSeconds = moment().diff(this._pumpOnTimestamp, "seconds");
        if (pumpRunTimeSeconds >= Config.autoTopOff.pumpCycleSeconds) {
            Logger.info("Pump has been on long enough, turning off");
            this._turnPumpOff();
        }
    }
};
