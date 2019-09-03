import Delay from "@/lib/Delay";
import Dimmer from "@/features/Dimmer";
import Shutdown from "@/lib/Shutdown";
import AutoTopOff from "@/features/AutoTopOff";

export default {
    async run() {
        await Dimmer.init();
        await AutoTopOff.init();

        // This should be the last thing initialized,
        // to guarantee that we can capture the signals we want to capture.
        await Shutdown.init();

        while (true) {
            await Dimmer.update();
            await AutoTopOff.update();

            await Delay.wait(1000);
        }
    }
};
