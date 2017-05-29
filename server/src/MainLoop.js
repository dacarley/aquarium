// @providesModule AQ-MainLoop

import Config from "AQ-Config";
import Dimmer from "AQ-Dimmer";
import DimmerScheduler from "AQ-DimmerScheduler";
import AutoTopOff from "AQ-AutoTopOff";

export default {
    run,

    _loop
};

async function run() {
    await Dimmer.connect();
    await AutoTopOff.init();

    await this._loop();
}

async function _loop() {
    const colorBrightnesses = await DimmerScheduler.getColorBrightnesses();
    await Dimmer.setColorBrightnesses(colorBrightnesses);

    await AutoTopOff.manageWaterLevel();

    setTimeout(() => {
        this._loop();
    }, Config.mainLoopDelay);
}
