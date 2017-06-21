// @providesModule AQ-AutoTopOff

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
    _turnPumpOn,
    _turnPumpOff,
    _enforceMaxPumpRuntime
};

function init() {
    WaterSensors.init();
    this.pump = new pigpio.Gpio(Config.autoTopOff.pumpPin, {
        pullUpDown: pigpio.Gpio.PUD_DOWN,
        mode: pigpio.Gpio.OUTPUT
    });

    this._turnPumpOff();

    Shutdown.register(() => this._shutdown());
}

function _shutdown() {
    this._turnPumpOff();
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
        Logger.alert("The reservoir is getting low", {
            waterLevels
        });
    }

    if (waterLevels.sump > Config.autoTopOff.sump.max) {
        Logger.info("Sump is above its max, turning off.");
        this._turnPumpOff();
    }

    if (waterLevels.sump < Config.autoTopOff.sump.min) {
        Logger.info("Sump is below its min, turning on.");
        this._turnPumpOn();
    }

    this._enforceMaxPumpRuntime();
}

function _turnPumpOn() {
    this.pumpOnTimestamp = moment().toISOString();
    this.pump.digitalWrite(1);
}

function _turnPumpOff() {
    this.pumpOnTimestamp = undefined;
    this.pump.digitalWrite(0);
}

function _enforceMaxPumpRuntime() {
    Logger.info("Checking pump runtime");
    if (!this.pumpOnTimestamp) {
        Logger.info("Pump is not on");

        return;
    }

    const diffSeconds = moment().diff(this.pumpOnTimestamp, "seconds");
    if (diffSeconds >= Config.pumpOnTimeSeconds) {
        Logger.info("Pump has been on long enough, turning off");
        this._turnPumpOff();

        return;
    }

    Logger.info("Pump can continue running");
}
