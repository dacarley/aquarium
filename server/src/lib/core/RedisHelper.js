/*
* @providesModule BP-RedisHelper
*/

import _ from "lodash";
import Redis from "ioredis";
import PromiseHelper from "AQ-PromiseHelper";
import Logger from "AQ-Logger";

export default {
    connect
};

async function connect() {
    const redis = new Redis();

    const service = {
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
        keysInHash,

        stringify,
        unstringify
    };

    return service;

    async function keys(pattern) {
        const allKeys = [];

        let done = false;
        let cursor = 0;
        while (!done) {
            // eslint-disable-next-line no-await-in-loop
            const result = await redis.scan(cursor, "MATCH", pattern, "COUNT", 500);

            allKeys.push(...(result[1]));
            cursor = result[0];
            done = Number(cursor) === 0;
        }

        return _.uniqBy(allKeys);
    }

    async function set(key, obj, prepareItem = service.stringify) {
        return redis.set(key, await prepareItem(obj));
    }

    async function get(key, parse = service.unstringify) {
        const buffer = await redis.getBuffer(key);

        return parse(buffer ? buffer.toString() : undefined);
    }

    function deleteKey(key) {
        return redis.del(key);
    }

    async function addManyToSet(key, items, prepareItem = service.stringify) {
        const values = await Promise.all(_.map(items, prepareItem));
        if (!values.length) {
            return;
        }

        return redis.sadd(key, values);
    }

    function removeManyFromSet(key, items) {
        if (items.length === 0) {
            return;
        }

        return redis.srem(key, items);
    }

    async function getAllFromSet(key) {
        const result = await scan(key, ::redis.sscan);

        return result;
    }

    async function addManyToSortedSet(key, items, prepareItem = service.stringify) {
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

        return redis.zadd(key, scoresAndItems);
    }

    function removeFromSortedSetByScore(key, min, max) {
        return redis.zremrangebyscore(key, min, max);
    }

    async function getAllFromSortedSet(key, parse = service.unstringify) {
        const result = await scan(key, ::redis.zscan);
        const items = _(result)
            .chunk(2)
            .sortBy(1)
            .map(0)
            .value();

        return _.map(items, item => parse(item));
    }

    async function addManyToHash(key, items, prepareItem = service.stringify) {
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

        return redis.hmset(key, fieldsAndValues);
    }

    async function getManyFromHash(key, fields, parse = service.unstringify) {
        if (_.isEmpty(fields)) {
            return {};
        }

        const buffers = await redis.hmgetBuffer(key, fields);
        const values = await PromiseHelper.map(buffers, async buffer => {
            return parse(buffer ? buffer.toString() : undefined);
        });

        return _.zipObject(fields, _.values(values));
    }

    async function getOneFromHash(key, field, parse = service.unstringify) {
        const results = await service.getManyFromHash(key, [field], parse);

        return results[field];
    }

    async function getAllFromHash(key, parse = service.unstringify) {
        const keysAndValues = await scan(key, ::redis.hscanBuffer);
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

        return redis.hdel(key, fields);
    }

    async function replaceHash(key, map) {
        await service.deleteKey(key);
        await service.addManyToHash(key, map);
    }

    function keysInHash(key) {
        return redis.hkeys(key);
    }

    async function replaceSet(key, items, prepareItem = service.stringify) {
        await service.deleteKey(key);
        await service.addManyToSet(key, items, prepareItem);
    }

    async function isInSet(key, value, prepareItem = service.stringify) {
        const isMember = await redis.sismember(key, prepareItem(value));

        return isMember !== 0;
    }

    async function replaceSortedSet(key, items) {
        await service.deleteKey(key);
        await service.addManyToSortedSet(key, items);
    }

    function getSetDifference(sourceKey, diffKey) {
        return redis.sdiff(sourceKey, diffKey);
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
}
