// @providesModule AQ-Shutdown

import PromiseHelper from "AQ-PromiseHelper";

export default {
    register,
    handleShutdown,

    _callbacks: []
};

function register(callback) {
    this._callbacks.push(callback);
}

async function handleShutdown() {
    await PromiseHelper.each(this._callbacks, async callback => {
        await callback();
    });

    process.exit(-1);
}
