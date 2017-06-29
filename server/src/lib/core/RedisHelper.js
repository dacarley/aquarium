// @providesModule AQ-RedisHelper

import _ from "lodash";
import Redis from "ioredis";
import PromiseHelper from "AQ-PromiseHelper";
import Logger from "AQ-Logger";

export default {
    init,

    keys,
    deleteKey,

    set,
    get,

    addManyToSet,
    removeManyFromSet,
    getAllFromSet,
    getSetDifference,
    replaceSet,
    isInSet,

    addManyToSortedSet,
    removeFromSortedSetByScore,
    getAllFromSortedSet,
    replaceSortedSet,

    addManyToHash,
    getManyFromHash,
    getOneFromHash,
    getAllFromHash,
    removeManyFromHash,
    replaceHash,
    keysInHash
};

async function init() {
    const params = {
        parser: "javascript",
        showFriendlyErrorStack: true
    };

    this.redis = new Redis(params);

    this.redis.on("error", (error) => {
        Logger.alert("RedisError", {
            error
        });
    });
}

async function keys(pattern) {
    const allKeys = [];

    let done = false;
    let cursor = 0;
    while (!done) {
        // eslint-disable-next-line no-await-in-loop
        const result = await this.redis.scan(cursor, "MATCH", pattern, "COUNT", 500);

        allKeys.push(...(result[1]));
        cursor = result[0];
        done = Number(cursor) === 0;
    }

    return _.uniqBy(allKeys);
}

async function set(key, obj, prepareItem = stringify) {
    const value = await prepareItem(obj);
    await this.redis.set(key, value);
}

async function get(key, parse = unstringify) {
    const buffer = await this.redis.getBuffer(key);

    return parse(buffer ? buffer.toString() : undefined);
}

function deleteKey(key) {
    return this.redis.del(key);
}

async function addManyToSet(key, items, prepareItem = stringify) {
    const values = await Promise.all(_.map(items, prepareItem));
    if (!values.length) {
        return;
    }

    return this.redis.sadd(key, values);
}

function removeManyFromSet(key, items) {
    if (items.length === 0) {
        return;
    }

    return this.redis.srem(key, items);
}

async function getAllFromSet(key) {
    const result = await scan(key, ::this.redis.sscan);

    return result;
}

async function addManyToSortedSet(key, items, prepareItem = stringify) {
    const promises = _.flatMap(items, (item, score) => {
        if (!_.isNumber(score) && !_.isNumber(parseFloat(score))) {
            Logger.throw("Scores must be numbers (integer or float, or a string that parses as a number)", {
                item,
                score
            });
        }
        const list = _.isArray(item) ? item : [item];

        return _.flatMap(list, item => [score, prepareItem(item)]);
    });

    const scoresAndItems = await Promise.all(promises);

    return this.redis.zadd(key, scoresAndItems);
}

function removeFromSortedSetByScore(key, min, max) {
    return this.redis.zremrangebyscore(key, min, max);
}

async function getAllFromSortedSet(key, parse = unstringify) {
    const result = await scan(key, ::this.redis.zscan);
    const items = _(result)
        .chunk(2)
        .sortBy(1)
        .map(0)
        .value();

    return _.map(items, item => parse(item));
}

async function addManyToHash(key, items, prepareItem = stringify) {
    const pairs = _(items)
        .map((item, key) => {
            return _.isNil(item)
                ? undefined
                : {
                    key,
                    item
                };
        })
        .compact()
        .value();

    if (_.isEmpty(pairs)) {
        return;
    }

    const promises = _.flatMap(pairs, pair => [pair.key, prepareItem(pair.item)]);
    const fieldsAndValues = await Promise.all(promises);

    return this.redis.hmset(key, fieldsAndValues);
}

async function getManyFromHash(key, fields, parse = unstringify) {
    if (_.isEmpty(fields)) {
        return {};
    }

    const buffers = await this.redis.hmgetBuffer(key, fields);
    const values = await PromiseHelper.map(buffers, async buffer => {
        return parse(buffer ? buffer.toString() : undefined);
    });

    return _.zipObject(fields, _.values(values));
}

async function getOneFromHash(key, field, parse = unstringify) {
    const results = await this.getManyFromHash(key, [field], parse);

    return results[field];
}

async function getAllFromHash(key, parse = unstringify) {
    const keysAndValues = await scan(key, ::this.redis.hscanBuffer);
    const buffers = _(keysAndValues)
        .chunk(2)
        .map(keyAndValue => ([keyAndValue[0].toString(), keyAndValue[1]]))
        .fromPairs()
        .value();

    const result = await PromiseHelper.map(buffers, async buffer => {
        return parse(buffer ? buffer.toString() : undefined);
    });

    return result;
}

async function scan(key, func) {
    const allResults = [];

    let done = false;
    let cursor = 0;
    while (!done) {
        // eslint-disable-next-line no-await-in-loop
        const result = await func(key, cursor, "COUNT", 500);
        allResults.push(...result[1]);

        cursor = result[0];
        done = Number(cursor) === 0;
    }

    return allResults;
}

function removeManyFromHash(key, fields) {
    if (fields.length === 0) {
        return;
    }

    return this.redis.hdel(key, fields);
}

async function replaceHash(key, map) {
    await this.deleteKey(key);
    await this.addManyToHash(key, map);
}

function keysInHash(key) {
    return this.redis.hkeys(key);
}

async function replaceSet(key, items, prepareItem = stringify) {
    await this.deleteKey(key);
    await this.addManyToSet(key, items, prepareItem);
}

async function isInSet(key, value, prepareItem = stringify) {
    const isMember = await this.redis.sismember(key, prepareItem(value));

    return isMember !== 0;
}

async function replaceSortedSet(key, items) {
    await this.deleteKey(key);
    await this.addManyToSortedSet(key, items);
}

function getSetDifference(sourceKey, diffKey) {
    return this.redis.sdiff(sourceKey, diffKey);
}

function stringify(value) {
    if (_.isString(value) || _.isBuffer(value)) {
        return value;
    }

    if (_.isArray(value) || _.isObject(value)) {
        return JSON.stringify(value);
    }

    return value.toString();
}

function unstringify(str) {
    if (_.isNil(str)) {
        return undefined;
    }

    if (!_.isString(str)) {
        Logger.throw("Non-string passed to unstringify", {
            str
        });
    }

    if (str[0] === "{" || str[0] === "[") {
        return JSON.parse(str);
    }

    return str;
}
