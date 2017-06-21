// @providesModule AQ-MainLoop

import Delay from "AQ-Delay";
import Dimmer from "AQ-Dimmer";
import Shutdown from "AQ-Shutdown";
import LogStreamingLoggly from "AQ-LogStreamingLoggly";
import AutoTopOff from "AQ-AutoTopOff";

/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */

export default {
    run,

    _loop
};

async function run() {
    // This should be the first thing initialized,
    // to guarantee that we can capture the signals we want to capture.
    await Shutdown.init();

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
