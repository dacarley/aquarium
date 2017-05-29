import Dimmer from "AQ-Dimmer";
import ColorBrightnesses from "AQ-ColorBrightnesses";
import Logger from "AQ-Logger";

main();

async function main() {
    try {
        await Dimmer.connect();
        Logger.info("Connected to dimmer");

        await Dimmer.setColorBrightnesses(ColorBrightnesses);
    } catch (err) {
        Logger.error(err);
        process.exit(-1);
    }
}
