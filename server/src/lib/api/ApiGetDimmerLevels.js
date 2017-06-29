// @providesModule AQ-ApiGetDimmerLevels

import RedisHelper from "AQ-RedisHelper";
import Logger from "AQ-Logger";

export default {
    method: "GET",
    route: "dimmerLevels",
    execute
};

async function execute() {
    const dimmerLevels = await RedisHelper.get("dimmerLevels");

    Logger.info("dimmerLevels", {
        dimmerLevels
    });

    return dimmerLevels;
}
