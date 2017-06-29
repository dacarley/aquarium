// @providesModule AQ-ApiGetWaterLevels

import RedisHelper from "AQ-RedisHelper";

export default {
    method: "GET",
    route: "waterLevels",
    execute
};

async function execute() {
    const waterLevels = await RedisHelper.get("waterLevels");

    return waterLevels;
}
