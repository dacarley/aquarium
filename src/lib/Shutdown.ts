interface ShutdownData {
    code?: number;
    reason?: {} | null;
    promise?: Promise<any>;
    error?: Error;
    signal?: NodeJS.Signals;
}

const callbacks = [] as (() => void)[];

export function init() {
    process.once("beforeExit", onBeforeExit);
    process.once("unhandledRejection", onUnhandledRejection);
    process.once("uncaughtException", onUncaughtException);
    process.once("SIGINT", onSignal);
    process.once("SIGTERM", onSignal);
    process.once("SIGQUIT", onSignal);
    process.once("SIGABRT", onSignal);
}

export function register(callback: () => void) {
    callbacks.push(callback);
}

function onBeforeExit(code: number) {
    logAndExit("Normal shutdown", {
        code
    });
}

function onUnhandledRejection(reason: {} | null | undefined, promise: Promise<any>) {
    logAndExit("Unhandled rejection", {
        reason,
        promise
    });
}

function onUncaughtException(error: Error) {
    logAndExit("Uncaught exception", {
        error
    });
}

function onSignal(signal: NodeJS.Signals) {
    logAndExit("Shutdown by signal", {
        signal
    });
}

async function logAndExit(msg: string, data: ShutdownData) {
    const code = data.code || -1;

    console.info(`\n\n${msg}`, {
        ...data,
        code
    });

    console.info("Calling shutdown callbacks...");
    for (const callback of callbacks) {
        await callback();
    }

    console.info("Exiting...");

    process.exit(code);
}
