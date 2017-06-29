// @providesModule AQ-Router

import cors from "cors";
import express from "express";
import Logger from "AQ-Logger";
import ApiRouter from "AQ-ApiRouter";
import root from "root-path";

export default {
    init
};

function init() {
    this.app = express();
    this.app.use(cors());
    this.app.use("/", express.static(root("client/build")));

    ApiRouter.init(this.app);

    this.app.listen(80, () => {
        Logger.info("App listening on port 80");
    });
}
