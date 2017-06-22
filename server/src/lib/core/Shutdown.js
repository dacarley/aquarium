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

const signals = [
    "unhandledRejection",
    "uncaughtException",
    "SIGINT",
    "SIGTERM",
    "SIGQUIT",
    "SIGABRT"
];

function init() {
    _.each(signals, signal => {
        process.on("unhandledRejection", async reason => {
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
        await callback();
    });

    process.exit(-1);
}
