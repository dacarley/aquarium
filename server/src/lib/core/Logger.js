// @providesModule AQ-Logger

/* eslint-disable no-console */

export default {
    info,
    error,

    _log
};

function info(msg, data) {
    return this._log("info", msg, data);
}

function error(msg, data) {
    return this._log("error", msg, data);
}

function _log(func, msg, data) {
    if (data) {
        // eslint-disable-next-line no-param-reassign
        msg = `${msg}: ${JSON.stringify(data, null, 4)}`;
    }

    console[func](msg);
}
