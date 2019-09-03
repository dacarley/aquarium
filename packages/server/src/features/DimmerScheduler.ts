import _ from "lodash";
import moment from "moment";
import UserSettings from "@/lib/UserSettings";
import Logger from "@/lib/Logger";

const timeOfDayPattern = /(\d+):(\d+)\s*(am|pm)/;

interface ColorBrightnesses {
    [key: string]: number;
}

interface ScheduleEntry {
    timeOfDay: string;
    factor: number | undefined;
    colors: {
        [key: string]: number;
    };
}

export default class DimmerScheduler {
    public static async getColorBrightnesses(): Promise<ColorBrightnesses> {
        const defaultColors = await UserSettings.get("defaultColors");
        const rawDimmingSchedule = await UserSettings.get("dimmingSchedule");

        const unsortedDimmingSchedule = _.map(rawDimmingSchedule, (entry: ScheduleEntry) => ({
            ...entry,
            timeOfDay: this._getTimeOfDay(entry.timeOfDay)
        }));

        const dimmingSchedule = _.sortBy(unsortedDimmingSchedule, "timeOfDay");

        console.log(dimmingSchedule);

        const now = moment();
        const next = this._findNext(now, dimmingSchedule);
        const previous = this._findPrevious(now, dimmingSchedule);

        const timeSpan = moment(next.timeOfDay).diff(previous.timeOfDay);
        const index = now.diff(previous.timeOfDay);
        const factor = index / timeSpan;

        const colorNames = _.keys(defaultColors);

        const colorBrightnesses = {} as ColorBrightnesses;

        colorNames.forEach(colorName => {
            const previousLevel = this._getColorLevel(previous, colorName);
            const nextLevel = this._getColorLevel(next, colorName);
            const difference = nextLevel - previousLevel;
            const newLevel = previousLevel + (difference * factor);

            colorBrightnesses[colorName] = newLevel;
        });

        return colorBrightnesses;
    }

    private static _getColorLevel(scheduleEntry: ScheduleEntry, colorName: string): number {
        const level = _.get(scheduleEntry.colors, colorName, 0);
        const factor = _.get(scheduleEntry, "factor", 1);

        return (level * factor) / 100;
    }

    private static _findNext(now: moment.Moment, dimmingSchedule: ScheduleEntry[]): ScheduleEntry {
        let next = _.find(dimmingSchedule, entry => !now.isAfter(entry.timeOfDay));

        if (next) {
            return next;
        }

        next = _.first(dimmingSchedule) as ScheduleEntry;

        return {
            ...next,
            timeOfDay: moment(next.timeOfDay).add(1, "day").toString()
        };
    }

    private static _findPrevious(now: moment.Moment, dimmingSchedule: ScheduleEntry[]): ScheduleEntry {
        let previous = _.findLast(dimmingSchedule, entry =>  !now.isBefore(entry.timeOfDay));

        if (previous) {
            return previous;
        }

        previous = _.last(dimmingSchedule) as ScheduleEntry;

        return {
            ...previous,
            timeOfDay: moment(previous.timeOfDay).subtract(1, "day").toISOString()
        };
    }

    private static _getTimeOfDay(timeOfDay: string): string {
        const parts = timeOfDay.match(timeOfDayPattern);
        if (!parts) {
            Logger.throw("Unparseable time of day", {
                timeOfDay
            });

            return moment().toISOString();
        }

        const ampm = parts[3];
        const hour = Number(parts[1]);
        const hours = (hour === 12 ? 0 : hour) + (ampm === "pm" ? 12 : 0);
        const minutes = Number(parts[2]);

        if (hour < 1 || hour > 23 || minutes < 0 || minutes > 59) {
            Logger.throw("Invalid time of day", {
                timeOfDay
            });

            return moment().toISOString();
        }

        return moment()
            .startOf("day")
            .add(hours, "hours")
            .add(minutes, "minutes")
            .toISOString();
    }
};
