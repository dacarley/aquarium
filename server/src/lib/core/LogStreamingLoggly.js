// @providesModule AQ-LogStreamingLoggly

import _ from "lodash";
import HttpRequest from "AQ-HttpRequest";
import Shutdown from "AQ-Shutdown";

export default {
    init,
    sendToLoggly,

    _pendingPosts: []
};

function init() {
    Shutdown.register(async () => {
        // eslint-disable-next-line no-console
        console.log("Waiting for pending logs to send");

        await Promise.all(this._pendingPosts);
    });
}

async function sendToLoggly(message) {
    const payload = JSON.stringify(message);

    const token = "19da9a4a-4280-4bf9-aecd-d17e069f3ff4";
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
