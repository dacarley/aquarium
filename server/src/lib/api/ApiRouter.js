// @providesModule AQ-ApiRouter

import _ from "lodash";
import Logger from "AQ-Logger";

const apis = [
    require("AQ-ApiGetWaterLevels")
];

export default {
    init,

    _doGet,
    _parseRequest
};

function init(app) {
    _.each(apis, api => {
        // eslint-disable-next-line no-param-reassign
        api = api.default;

        switch (api.method) {
            case "GET":
                app.get(`/api/${api.route}`, (req, res) => this._doGet(req, res, api));
                break;

            default:
                Logger.throw("Unrecognized API method", {
                    api
                });
        }
    });
}

async function _doGet(req, res, api) {
    const params = await this._parseRequest(req, api);
    const result = await api.execute(params);

    res.json(result);
}

async function _parseRequest(req, api) {
    const parseRequest = api.parseRequest || (() => req.params);
    const params = await parseRequest(req);

    return params;
}
