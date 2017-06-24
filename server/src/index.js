import Logger from "AQ-Logger";
import MainLoop from "AQ-MainLoop";
import Shutdown from "AQ-Shutdown";

const oldExit = process.exit;
process.exit = code => {
    Logger.info("process.exit called", {
        code,
        error: new Error("process.exit call stack")
    });

    oldExit(code);
};

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
