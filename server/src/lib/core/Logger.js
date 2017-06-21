// @providesModule AQ-Logger

import moment from "moment";
import LogStreamingLoggly from "AQ-LogStreamingLoggly";

const consoleFuncMap = {
    info: "info",
    warn: "warn",
    error: "error",
    alert: "error",
    throw: "error"
};

const service = {
    info: (...args) => service._log("info", ...args),
    error: (...args) => service._log("error", ...args),
    alert: (...args) => service._log("alert", ...args),
    throw: (...args) => service._log("throw", ...args),

    alertHourly,

    _log,

    _alertTimestamps: {}
};

export default service;

function alertHourly(msg, data) {
    const lastAlertTimestamp = this._alertTimestamps[msg] || moment("1975-11-23T00:00:00.000Z");
    const now = moment();

    const secondsSinceLastAlert = now.diff(lastAlertTimestamp, "seconds");
    if (secondsSinceLastAlert < 3600) {
        return;
    }

    this._alertTimestamps[msg] = now;
    this.alert(msg, data);
}

function _log(type, msg, data) {
    const loggedMsg = data
        ? `${msg}: ${JSON.stringify(data, null, 4)}`
        : msg;

    LogStreamingLoggly.sendToLoggly({
        timestamp: moment().toISOString(),
        type,
        msg,
        data
    });

    const func = consoleFuncMap[type];

    // eslint-disable-next-line no-console
    console[func](loggedMsg);

    if (func === "throw") {
        throw new Error(loggedMsg);
    }
}
