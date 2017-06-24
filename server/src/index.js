import Logger from "AQ-Logger";
import MainLoop from "AQ-MainLoop";
import Shutdown from "AQ-Shutdown";

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
