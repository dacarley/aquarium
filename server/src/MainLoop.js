// @providesModule AQ-MainLoop

import Config from "AQ-Config";
import Dimmer from "AQ-Dimmer";
import Logger from "AQ-Logger";
import DimmerScheduler from "AQ-DimmerScheduler";
import AutoTopOff from "AQ-AutoTopOff";

export default {
    run,

    _loop
};

async function run() {
    Logger.info("Connecting to dimmer");
    await Dimmer.connect();
    Logger.info("Initializing AutoTopOff");
    await AutoTopOff.init();

    Logger.info("Starting the loop");
    await this._loop();
}

async function _loop() {
    Logger.info("Running the loop");
    const colorBrightnesses = await DimmerScheduler.getColorBrightnesses();
    await Dimmer.setColorBrightnesses(colorBrightnesses);

    await AutoTopOff.manageWaterLevel();

    setTimeout(() => {
        this._loop();
    }, Config.mainLoopDelay);
}
