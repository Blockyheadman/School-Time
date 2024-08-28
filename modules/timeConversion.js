/*
 * Copyright (c) 2024. Elijah McCalley
 * All rights reserved.
 */

export {clockTimeToTimestamp, dateTimeToTimestamp, CLOCK_TIME_REGEX, DATE_REGEX};

const CLOCK_TIME_REGEX = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/;
const DATE_REGEX = /^(0?[1-9]|1[0-2])[\/-]([0-2]?[0-9]|3[0-1])[\/-]([0-9]{4})$/;

/**
 *
 * Turns a given time into a UNIX timestamp.
 *
 * @param time {string} - In military format (22:06)
 * @returns {number}
 */
function clockTimeToTimestamp(time) {
    // Check if given time is correct format
    if (!CLOCK_TIME_REGEX.test(time)) {
        throw RangeError(`Invalid time input "${time}".\nMust follow Military time format (eg. 22:06).`);
    }

    const TIMES = time.split(':');
    const CURRENT_DATE = new Date();

    CURRENT_DATE.setHours(TIMES[0]);
    CURRENT_DATE.setMinutes(TIMES[1]);
    CURRENT_DATE.setSeconds(0);
    CURRENT_DATE.setMilliseconds(0);

    return CURRENT_DATE.getTime();
}

/**
 *
 * Takes in a date and optionally time and converts it to UNIX timestamp
 *
 * @param {string} date - In MM/DD/YYYY format (5/20/2026 OR 05-20-2026)
 * @param {string} time - (Optional) In military format (22:06)
 *
 * Defaults to 00:00
 *
 * @returns {number} - The UNIX timestamp of the given date and time.
 */
function dateTimeToTimestamp(date, time = "23:59") {
    // Check if given time is correct format or empty
    if (!CLOCK_TIME_REGEX.test(time)) {
        throw RangeError(`Invalid time input "${time}".\nMust follow Military time format (eg. 22:06).`);
    }

    // Check if date format is correct
    if (!DATE_REGEX.test(date)) {
        throw RangeError(`Invalid date input "${date}".\nMust follow MM/DD/YYYY format (eg. 5/20/2026 OR 05-20-2026).`);
    }

    const TIMES = time.split(':');
    const DATES = date.split(/[\/-]/);
    const CURRENT_DATE = new Date();

    CURRENT_DATE.setMonth(parseInt(DATES[0]) - 1, parseInt(DATES[1]));
    CURRENT_DATE.setFullYear(parseInt(DATES[2]));

    CURRENT_DATE.setHours(TIMES[0]);
    CURRENT_DATE.setMinutes(TIMES[1]);

    CURRENT_DATE.setSeconds(0);
    CURRENT_DATE.setMilliseconds(0);

    return CURRENT_DATE.getTime();
}