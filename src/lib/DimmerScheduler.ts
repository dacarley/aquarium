import moment from "moment";
import * as UserSettings from "$lib/UserSettings";

const timeOfDayPattern = /(\d+):(\d+)\s*(am|pm)/;

type DefaultColors = {
    RoyalBlue: number,
    UV: number,
    ColdWhite: number,
    WarmWhite: number,
    Red: number,
    Green: number,
    Blue: number,
}

export type ColorBrightnesses = {
    [key: string]: number;
}

export type ScheduleEntry = {
    timeOfDay: string;
    factor: number | undefined;
    colors: {
        [key: string]: number;
    };
}

export async function getColorBrightnesses() {
    const defaultColors = await UserSettings.getValue("defaultColors") as DefaultColors;
    const rawDimmingSchedule = await UserSettings.getValue("dimmingSchedule") as ScheduleEntry[];

    const unsortedDimmingSchedule = rawDimmingSchedule.map(entry => ({
        ...entry,
        timeOfDay: getTimeOfDay(entry.timeOfDay)
    }));

    const dimmingSchedule = unsortedDimmingSchedule.sort((a, b) => {
        if (a.timeOfDay < b.timeOfDay) {
            return -1;
        }

        if (b.timeOfDay < a.timeOfDay) {
            return 1;
        }

        return 0;
    });

    const now = moment();
    const next = _findNext(now, dimmingSchedule);
    const previous = _findPrevious(now, dimmingSchedule);

    const timeSpan = moment(next.timeOfDay).diff(previous.timeOfDay);
    const index = now.diff(previous.timeOfDay);
    const factor = index / timeSpan;

    const colorNames = Object.keys(defaultColors);

    const colorBrightnesses = {} as ColorBrightnesses;

    colorNames.forEach(colorName => {
        const previousLevel = getColorLevel(previous, colorName);
        const nextLevel = getColorLevel(next, colorName);
        const difference = nextLevel - previousLevel;
        const newLevel = previousLevel + (difference * factor);

        colorBrightnesses[colorName] = newLevel;
    });

    return colorBrightnesses;
}

function getColorLevel(scheduleEntry: ScheduleEntry, colorName: string) {
    const level = scheduleEntry.colors[colorName] || 0;
    const factor = scheduleEntry.factor || 1;

    return (level * factor) / 100;
}

function _findNext(now: moment.Moment, dimmingSchedule: ScheduleEntry[]) {
    let next;
    for (const entry of dimmingSchedule) {
        if (!now.isAfter(entry.timeOfDay)) {
            next = entry;
            break;
        }
    }

    if (next) {
        return next;
    }

    next = dimmingSchedule[0];

    return {
        ...next,
        timeOfDay: moment(next.timeOfDay).add(1, "day").toString()
    };
}

function _findPrevious(now: moment.Moment, dimmingSchedule: ScheduleEntry[]) {
    let previous;
    for (const entry of dimmingSchedule) {
        if (!now.isBefore(entry.timeOfDay)) {
            previous = entry;
        }
    }

    if (previous) {
        return previous;
    }

    previous = dimmingSchedule[dimmingSchedule.length - 1];

    return {
        ...previous,
        timeOfDay: moment(previous.timeOfDay).subtract(1, "day").toISOString()
    };
}

function getTimeOfDay(timeOfDay: string) {
    const parts = timeOfDay.match(timeOfDayPattern);
    if (!parts) {
        throw new Error(`Unparseable time of day: ${timeOfDay}`);
    }

    const ampm = parts[3];
    const hour = Number(parts[1]);
    const hours = (hour === 12 ? 0 : hour) + (ampm === "pm" ? 12 : 0);
    const minutes = Number(parts[2]);

    if (hour < 1 || hour > 23 || minutes < 0 || minutes > 59) {
        throw new Error(`Invalid time of day: ${timeOfDay}`);
    }

    return moment()
        .startOf("day")
        .add(hours, "hours")
        .add(minutes, "minutes")
        .toISOString();
}