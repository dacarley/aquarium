// @providesModule AQ-MainLoop

import Delay from "AQ-Delay";
import Dimmer from "AQ-Dimmer";
import LogStreamingLoggly from "AQ-LogStreamingLoggly";
import AutoTopOff from "AQ-AutoTopOff";

/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */

export default {
    run,

    _loop
};

async function run() {
    await LogStreamingLoggly.init();
    await Dimmer.init();
    await AutoTopOff.init();

    while (true) {
        await this._loop();
    }
}

async function _loop() {
    await Dimmer.update();
    await AutoTopOff.update();

    await Delay.wait(1000);
}
