import Logger from "@/lib/Logger";

interface ShutdownData {
    code?: number;
    reason?: {} | null;
    promise?: Promise<any>;
    error?: Error;
    signal?: NodeJS.Signals;
}

export default class Shutdown {
    private static _callbacks = [] as (() => void)[];

    public static init(): void {
        process.once("beforeExit", this._onBeforeExit);
        process.once("unhandledRejection", this._onUnhandledRejection);
        process.once("uncaughtException", this._onUncaughtException);
        process.once("SIGINT", this._onSignal);
        process.once("SIGTERM", this._onSignal);
        process.once("SIGQUIT", this._onSignal);
        process.once("SIGABRT", this._onSignal);
    }

    public static register(callback: () => void): void  {
        this._callbacks.push(callback);
    }

    private static _onBeforeExit(code: number): void {
        this._logAndExit("Normal shutdown", {
            code
        });
    }

    private static _onUnhandledRejection(reason: {} | null | undefined, promise: Promise<any>): void {
        this._logAndExit("Unhandled rejection", {
            reason,
            promise
        });
    }

    private static _onUncaughtException(error: Error): void {
        this._logAndExit("Uncaught exception", {
            error
        });
    }

    private static _onSignal(signal: NodeJS.Signals): void {
        this._logAndExit("this by signal", {
            signal
        });
    }

    private static _logAndExit(msg: string, data: ShutdownData): void {
        const code = data.code || -1;

        Logger.info(msg, {
            ...data,
            code
        });

        Logger.info("Calling shutdown callbacks...");
        this._callbacks.forEach(callback => {
            callback();
        });

        process.exit(code);
    }
};
