// @providesModule AQ-Shutdown

import _ from "lodash";
import Logger from "AQ-Logger";

/* eslint-disable no-console */

export default {
    init,
    register,

    _callbacks: []
};

const signals = [
    "beforeExit",
    "unhandledRejection",
    "uncaughtException",
    "SIGINT",
    "SIGTERM",
    "SIGQUIT",
    "SIGABRT"
];

function init() {
    _.each(signals, signal => {
        process.once(signal, async reason => {
            Logger.info("Shutdown", {
                signal,
                reason
            });

            process.exit(-1);
        });
    });
}

function register(callback) {
    this._callbacks.push(callback);
}
