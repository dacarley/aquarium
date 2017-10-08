// @providesModule AQ-Shutdown

import _ from "lodash";
import Logger from "AQ-Logger";
import PromiseHelper from "AQ-PromiseHelper";

/* eslint-disable no-console */

export default {
    init,
    register,
    _handleShutdown,

    _callbacks: []
};

const originalProcessExit = process.exit;
process.exit = code => {
    Logger.info("process.exit called", {
        code,
        error: new Error("process.exit call stack")
    });

    originalProcessExit(code);
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

            await this._handleShutdown();
        });
    });
}

function register(callback) {
    this._callbacks.push(callback);
}

async function _handleShutdown() {
    await PromiseHelper.each(this._callbacks, async callback => {
        try {
            await callback();
        } catch (err) {
            console.log("Caught an error during shutdown", err);
        }
    });

    console.log("Finished shudown.");

    originalProcessExit(-1);
}
