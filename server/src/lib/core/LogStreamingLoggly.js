// @providesModule AQ-LogStreamingLoggly

import _ from "lodash";
import HttpRequest from "AQ-HttpRequest";

export default {
    sendToLoggly,

    _pendingPosts: []
};

async function sendToLoggly(message) {
    const payload = JSON.stringify(message);

    const token = "3af27fd8-703f-4245-b975-d75d6aa4d752";
    const url = `https://logs-01.loggly.com/inputs/${token}/tag/aquarium`;
    const options = {
        headers: {
            "Content-Type": "application/json",
            "Content-Length": payload.length
        }
    };

    const promise = HttpRequest.post(url, payload, options);
    this._pendingPosts.push(promise);

    await promise;

    _.pull(this._pendingPosts, promise);
}
