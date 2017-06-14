// @providesModule AQ-DimmerScheduler

import UserSettings from "AQ-UserSettings";

export default {
    getColorBrightnesses
};

async function getColorBrightnesses() {
    const dimmingSchedule = await UserSettings.get("dimmingSchedule");

    return dimmingSchedule[0].colors;
}
