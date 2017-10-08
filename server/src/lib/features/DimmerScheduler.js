// @providesModule AQ-DimmerScheduler

import _ from "lodash";
import moment from "moment";
import UserSettings from "AQ-UserSettings";
import Logger from "AQ-Logger";
import MapBuilder from "AQ-MapBuilder";

const timeOfDayPattern = /(\d+):(\d+)\s*(am|pm)/;

export default {
    getColorBrightnesses,

    _getColor,
    _findNext,
    _findPrevious,
    _getTimeOfDay
};

async function getColorBrightnesses() {
    const defaultColors = await UserSettings.get("defaultColors");
    const rawDimmingSchedule = await UserSettings.get("dimmingSchedule");
    const dimmingSchedule = _(rawDimmingSchedule)
        .map(entry => ({
            ...entry,
            timeOfDay: this._getTimeOfDay(entry.timeOfDay)
        }))
        .sortBy("timeOfDay")
        .value();

    const now = moment();
    const next = this._findNext(now, dimmingSchedule);
    const previous = this._findPrevious(now, dimmingSchedule);

    const timeSpan = moment(next.timeOfDay).diff(previous.timeOfDay);
    const index = now.diff(previous.timeOfDay);
    const factor = index / timeSpan;

    const colorNames = _.keys(defaultColors);

    return MapBuilder.build(colorNames, _.identity, colorName => {
        const previousLevel = this._getColor(previous, colorName);
        const nextLevel = this._getColor(next, colorName);
        const difference = nextLevel - previousLevel;
        const newLevel = previousLevel + (difference * factor);

        return newLevel;
    });
}

function _getColor(scheduleEntry, colorName) {
    const level = _.get(scheduleEntry.colors, colorName, 0);
    const factor = _.get(scheduleEntry, "factor", 1);

    return (level * factor) / 100;
}

function _findNext(now, dimmingSchedule) {
    const next = _.find(dimmingSchedule, entry => entry.override || !now.isAfter(entry.timeOfDay));

    if (next) {
        if (next.override) {
            next.timeOfDay = now.add(1, "hour");
        }

        return next;
    }

    const first = _.first(dimmingSchedule);

    return {
        ...first,
        timeOfDay: moment(first.timeOfDay).add(1, "day")
    };
}

function _findPrevious(now, dimmingSchedule) {
    const previous = _.findLast(dimmingSchedule, entry => entry.override || !now.isBefore(entry.timeOfDay));

    if (previous) {
        if (previous.override) {
            previous.timeOfDay = now.subtract(1, "hour");
        }

        return previous;
    }

    const last = _.last(dimmingSchedule);

    return {
        ...last,
        timeOfDay: moment(last.timeOfDay).subtract(1, "day")
    };
}

function _getTimeOfDay(timeOfDay) {
    const parts = timeOfDay.match(timeOfDayPattern);
    if (!parts) {
        Logger.throw("Unparseable time of day", {
            timeOfDay
        });

        return undefined;
    }

    const ampm = parts[3];
    const hour = Number(parts[1]);
    const hours = (hour === 12 ? 0 : hour) + (ampm === "pm" ? 12 : 0);
    const minutes = Number(parts[2]);

    if (hour < 1 || hour > 23 || minutes < 0 || minutes > 59) {
        Logger.throw("Invalid time of day", {
            timeOfDay
        });

        return undefined;
    }

    return moment()
        .startOf("day")
        .add(hours, "hours")
        .add(minutes, "minutes")
        .toISOString();
}
