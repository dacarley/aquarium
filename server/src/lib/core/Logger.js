// @providesModule AQ-Logger

import _ from "lodash";
import moment from "moment";
import LogStreamingLoggly from "AQ-LogStreamingLoggly";
import ErrorHelper from "AQ-ErrorHelper";

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
    _processData,
    _translateValue,

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
    const processedData = this._processData(data);
    const loggedMsg = data
        ? `${msg}: ${JSON.stringify(processedData, null, 4)}`
        : msg;

    const func = consoleFuncMap[type];

    // eslint-disable-next-line no-console
    console[func](loggedMsg);

    LogStreamingLoggly.sendToLoggly({
        timestamp: moment().toISOString(),
        type,
        msg,
        data: processedData
    });

    if (type === "throw") {
        throw new Error(loggedMsg);
    }
}

function _processData(data) {
    if (!data) {
        return undefined;
    }

    return _.mapValues(data, value => this._translateValue(value));
}

function _translateValue(value) {
    if (_.isError(value)) {
        return ErrorHelper.toJSON(value);
    }

    if (moment.isMoment(value)) {
        return value.toISOString();
    }

    if (_.isObjectLike(value)) {
        return this._processData(_.toPlainObject(value));
    }

    return value;
}
