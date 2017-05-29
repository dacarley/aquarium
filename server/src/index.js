import Logger from "AQ-Logger";
import MainLoop from "AQ-MainLoop";

main();

async function main() {
    try {
        MainLoop.run();
    } catch (err) {
        Logger.error("A fatal error occurred.", {
            err: err.stack
        });
        process.exit(-1);
    }
}
