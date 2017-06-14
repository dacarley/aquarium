// @providesModule AQ-AutoTopOff

import moment from "moment";
import Config from "AQ-Config";
import Shutdown from "AQ-Shutdown";

export default {
    init,
    shutdown,
    manageWaterLevel,

    _checkWaterLevel,
    _checkReservoirLevel,
    _turnPumpOn,
    _turnPumpOff
};

function init() {
    this.pumpOnTimestamp = undefined;

    Shutdown.register(() => this.shutdown());
}

function shutdown() {
}

async function manageWaterLevel() {
    await this._checkReservoirLevel();

    if (this.pumpOnTimestamp) {
        const diffSeconds = moment().diff(this.pumpOnTimestamp, "seconds");
        if (diffSeconds >= Config.pumpOnTimeSeconds) {
            await this._turnPumpOff();
        }

        return;
    }

    await this._checkWaterLevel();
}

function _checkReservoirLevel() {
    // do nothing
}

function _checkWaterLevel() {
    // do nothing
}

function _turnPumpOn() {
    this.pumpOnTimestamp = moment().toISOString();
}

function _turnPumpOff() {
    this.pumpOnTimestamp = undefined;
}
