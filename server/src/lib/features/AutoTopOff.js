// @providesModule AQ-AutoTopOff

import _ from "lodash";
import moment from "moment";
import Config from "AQ-Config";
import Shutdown from "AQ-Shutdown";
import Logger from "AQ-Logger";
import WaterSensors from "AQ-WaterSensors";
import pigpio from "pigpio";

export default {
    init,
    update,

    _shutdown,
    _isPumpOn,
    _canTurnPumpOn,
    _turnPumpOn,
    _turnPumpOff,
    _enforceMaxPumpRuntime
};

async function init() {
    WaterSensors.init();
    this.pump = new pigpio.Gpio(Config.autoTopOff.pumpPin, {
        pullUpDown: pigpio.Gpio.PUD_DOWN,
        mode: pigpio.Gpio.OUTPUT
    });

    this._turnPumpOff();
    this._pumpOffTimestamp = undefined;

    Shutdown.register(() => this._shutdown());
}

function _shutdown() {
    this._turnPumpOff();

    pigpio.terminate();
}

async function update() {
    const waterLevels = await WaterSensors.readWaterLevels();
    Logger.info("waterLevels", waterLevels);

    // if (waterLevels.reservoir < Config.autoTopOff.reservoir.min) {
    //     this._turnPumpOff();
    //
    //     return;
    // }

    if (waterLevels.reservoir < Config.autoTopOff.reservoir.alert) {
        Logger.alertHourly("The reservoir is getting low", {
            waterLevels
        });
    }

    const isPumpOn = this._isPumpOn();

    if (isPumpOn && waterLevels.sump > Config.autoTopOff.sump.max) {
        this._turnPumpOff();
        Logger.info("Sump is above its max, turned pump off.");
    }

    if (!isPumpOn && waterLevels.sump < Config.autoTopOff.sump.min) {
        this._turnPumpOn(() => {
            Logger.info("Sump is below its min, turned pump on.");
        });
    }

    this._enforceMaxPumpRuntime();
}

function _isPumpOn() {
    return !_.isNil(this._pumpOnTimestamp);
}

function _canTurnPumpOn() {
    if (this._isPumpOn()) {
        return false;
    }

    const timestamp = _.get(this, "_pumpOffTimestamp", "1975-11-23T00:00:00.000Z");
    const offSeconds = moment().diff(timestamp, "seconds");

    return offSeconds >= Config.autoTopOff.pumpCooldownTimeSeconds;
}

function _turnPumpOn(callback) {
    if (this._isPumpOn()) {
        return;
    }

    if (!this._canTurnPumpOn()) {
        return;
    }

    this._pumpOnTimestamp = moment().toISOString();
    this._pumpOffTimestamp = undefined;
    this.pump.digitalWrite(1);

    callback();
}

function _turnPumpOff() {
    this._pumpOnTimestamp = undefined;
    this._pumpOffTimestamp = moment().toISOString();
    this.pump.digitalWrite(0);
}

function _enforceMaxPumpRuntime() {
    if (!this._isPumpOn()) {
        return;
    }

    const pumpRunTimeSeconds = moment().diff(this._pumpOnTimestamp, "seconds");
    if (pumpRunTimeSeconds >= Config.autoTopOff.maxPumpRunTimeSeconds) {
        Logger.info("Pump has been on long enough, turning off");
        this._turnPumpOff();
    }
}
