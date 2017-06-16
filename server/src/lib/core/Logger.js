// @providesModule AQ-Logger

import moment from "moment";
import LogStreamingLoggly from "AQ-LogStreamingLoggly";

/* eslint-disable no-console */

export default {
    info,
    error,
    throw: _throw,

    _log
};

function info(msg, data) {
    return this._log("info", msg, data);
}

function error(msg, data) {
    return this._log("error", msg, data);
}

function _throw(msg, data) {
    const errorMsg = this._log("error", msg, data);

    throw new Error(errorMsg);
}

function _log(func, msg, data) {
    const loggedMsg = data
        ? `${msg}: ${JSON.stringify(data, null, 4)}`
        : msg;

    LogStreamingLoggly.sendToLoggly({
        timestamp: moment().toISOString(),
        msg,
        data
    });

    console[func](loggedMsg);

    return loggedMsg;
}
