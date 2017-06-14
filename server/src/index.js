import Logger from "AQ-Logger";
import MainLoop from "AQ-MainLoop";
import Shutdown from "AQ-Shutdown";

/* eslint-disable no-console */

main();

async function main() {
    try {
        MainLoop.run();
    } catch (err) {
        Logger.error("A fatal error occurred.", {
            err: err.stack
        });

        await Shutdown.handleShutdown();
    }
}

process.on("unhandledRejection", async reason => {
    console.log("Unhandled Promise Rejection!");
    console.log(reason);
    await Shutdown.handleShutdown();
});

process.on("SIGINT", async () => {
    Logger.info("Caught interrupt signal");
    await Shutdown.handleShutdown();
});

process.on("SIGTERM", async () => {
    Logger.info("Caught terminate signal");
    await Shutdown.handleShutdown();
});
