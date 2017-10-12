// @providesModule AQ-ApiGetWaterLevels

import RedisHelper from "AQ-RedisHelper";

export default {
    method: "GET",
    route: "waterLevels",
    execute
};

function execute() {
    return RedisHelper.get("waterLevels");
}
