// @providesModule AQ-ApiGetDimmerLevels

import RedisHelper from "AQ-RedisHelper";
import Logger from "AQ-Logger";

export default {
    method: "GET",
    route: "dimmerLevels",
    execute
};

function execute() {
    return RedisHelper.get("dimmerLevels");
}
