// @providesModule AQ-PromiseHelper

import _ from "lodash";

export default {
    each
};

async function each(items, callback) {
    const keys = _.keys(items);
    const values = _.values(items);

    for (let i = 0; i < keys.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await callback(values[i], keys[i]);
    }
}
