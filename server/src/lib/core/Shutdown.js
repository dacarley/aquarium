// @providesModule AQ-Shutdown

import Logger from "AQ-Logger";
import PromiseHelper from "AQ-PromiseHelper";

/* eslint-disable no-console */

export default {
    init,
    register,
    _handleShutdown,

    _callbacks: []
};

function init() {
    process.on("unhandledRejection", async reason => {
        console.log("Unhandled Promise Rejection!");
        console.log(reason);
        await this._handleShutdown();
    });

    process.on("SIGINT", async () => {
        Logger.info("Caught interrupt signal");
        await this._handleShutdown();
    });

    process.on("SIGTERM", async () => {
        Logger.info("Caught terminate signal");
        await this._handleShutdown();
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
