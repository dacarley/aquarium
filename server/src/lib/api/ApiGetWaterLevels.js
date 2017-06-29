// @providesModule AQ-ApiGetWaterLevels

import RedisHelper from "AQ-RedisHelper";

export default {
    method: "GET",
    route: "waterLevels",
    execute
};

async function execute() {
    const redis = await RedisHelper.connect();
    const waterLevels = await redis.get("waterLevels");

    return waterLevels;
}
