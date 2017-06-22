// @providesModule AQ-ErrorHelper

import _ from "lodash";

export default {
    toJSON,

    _processStack
};

function toJSON(err) {
    const plainObject = {};

    Object.getOwnPropertyNames(err).forEach(key => {
        const value = err[key];
        switch (key) {
            case "stack":
                plainObject[key] = this._processStack(value);
                break;

            default:
                plainObject[key] = value;
                break;
        }
    });

    return plainObject;
}

function _processStack(rawStack) {
    if (!_.isString(rawStack)) {
        return rawStack;
    }

    const stack = rawStack.split("\n");

    return _.map(stack, entry => {
        return entry
            .replace(/.*\/CodePush\/main\.jsbundle/, "main.jsbundle")
            .replace(/.*\/CodePush\/index\.android\.bundle/, "index.android.bundle");
    });
}
