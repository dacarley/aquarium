// @providesModule AQ-MainLoop

import Delay from "AQ-Delay";
import Dimmer from "AQ-Dimmer";
import Shutdown from "AQ-Shutdown";
import LogStreamingLoggly from "AQ-LogStreamingLoggly";
import AutoTopOff from "AQ-AutoTopOff";
import Router from "AQ-Router";

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
    await Router.init();

    // This should be the last thing initialized,
    // to guarantee that we can capture the signals we want to capture.
    await Shutdown.init();

    while (true) {
        await this._loop();
    }
}

async function _loop() {
    await Dimmer.update();
    await AutoTopOff.update();

    await Delay.wait(1000);
}
