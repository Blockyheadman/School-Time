export {clockTimeToTimestamp};

/**
 *
 * Turns a given time into a UNIX timestamp.
 *
 * @param time {string} - In military format (22:06)
 * @returns {RangeErrorConstructor|number}
 */
function clockTimeToTimestamp(time) {
    // Check if given time is correct format
    if (!/^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/.test(time)) {
        return RangeError;
    }

    const times = time.split(':');
    const currentDate = new Date();

    currentDate.setHours(times[0]);
    currentDate.setMinutes(times[1]);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);

    return currentDate.getTime();
}

/**
 *
 * Takes in a date and time and converts it to UNIX timestamp
 *
 * @param {string} date - In MM/DD/YYYY format (5/20/2026)
 * @param {string} time - In military format (22:06)
 * @returns {RangeErrorConstructor|number}
 */
function dateTimeToTimestamp(date, time) {
    // Check if given time is correct format
    if (!/^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/.test(time)) {
        return RangeError;
    }

    // Check if date format is correct
    if (!/^(0[1-9]|[1-9]|1[0-2])\/(0[1-9]|[1-9]|1[0-9]|2[0-9]|3[0-1])\/([0-9]{4})$/.test(time)) {
        return RangeError;
    }

    const times = time.split(':');
    const dates = date.split("/");
    const currentDate = new Date();

    currentDate.setMonth(dates[0], dates[1]);
    currentDate.setFullYear(dates[2]);

    currentDate.setHours(times[0]);
    currentDate.setMinutes(times[1]);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);

    return currentDate.getTime();
}