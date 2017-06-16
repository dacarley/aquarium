// @providesModule AQ-MapBuilder

import _ from "lodash";

export default {
    build
};

function build(items, _getKey = _.identity, _getValue = _.stubTrue) {
    const getKey = _.iteratee(_getKey);
    const getValue = _.iteratee(_getValue);

    return _(items)
        .map((item, key) => [getKey(item, key), getValue(item, key)])
        .fromPairs()
        .value();
}
