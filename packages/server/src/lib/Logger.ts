import _ from "lodash";
import moment from "moment";
import LogStreamingLoggly from "@/lib/LogStreamingLoggly";
import ErrorHelper from "@/lib/ErrorHelper";

interface ConsoleFuncMapping {
    [key: string]: "info" | "warn" | "error";
}

const consoleFuncMap = {
    info: "info",
    warn: "warn",
    error: "error",
    alert: "error",
    throw: "error"
} as ConsoleFuncMapping;

export default class Logger {
    public static info(msg: string, data: any = undefined): void {
        this._log("info", msg, data);
    }

    public static error(msg: string, data: any = undefined): void {
        this._log("error", msg, data);
    }

    public static alert(msg: string, data: any = undefined): void {
        this._log("alert", msg, data);
    }

    public static throw(msg: string, data: any = undefined): void {
        this._log("throw", msg, data);
    }

    private static _log(type: string, msg: string, data: any): void {
        const processedData = this._processData(data);
        const loggedMsg = data
            ? `${msg}: ${JSON.stringify(processedData, null, 4)}`
            : msg;

        const func = consoleFuncMap[type];

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

    private static _processData(data: any): any {
        if (!data) {
            return undefined;
        }

        return _.mapValues(data, value => this._translateValue(value));
    }

    private static _translateValue(value: any): any {
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
}
