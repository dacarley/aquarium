import * as Dimmer from "$lib/Dimmer";
import * as Shutdown from "$lib/Shutdown"
import { delay } from "$lib/delay"

run();

async function run() {
    await Dimmer.init();
    await Shutdown.init();

    while (true) {
        await Dimmer.update();

        await delay(1000);
    }
}
