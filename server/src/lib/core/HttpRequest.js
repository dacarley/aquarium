/*
* @providesModule AQ-HttpRequest
*/

import request from "request";
import Logger from "AQ-Logger";

export default {
    get,
    getJSON,
    post
};

function makeRequest(options) {
    return new Promise((resolve, reject) => {
        request(options, (err, _response, body) => {
            if (err) {
                return reject(err);
            }

            resolve(body);
        });
    });
}

async function get(url, options) {
    try {
        const body = await makeRequest({
            url,
            gzip: true,
            ...options
        });

        return body;
    } catch (err) {
        Logger.error(`Requesting ${url} failed. ${err}`);
        throw err;
    }
}

async function getJSON(url, options) {
    const json = await get(url, options);

    return JSON.parse(json);
}

async function post(url, payload, options) {
    try {
        const body = await makeRequest({
            url,
            method: "POST",
            body: payload,
            ...options
        });

        return body;
    } catch (err) {
        Logger.error(`Posting to ${url} failed.  ${err}`);
        throw err;
    }
}
