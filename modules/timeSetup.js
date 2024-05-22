import {clockTimeToTimestamp} from "./timeConverstion.js";

export {setTimes, setPeriodTimes};

/**
 * Sets time visuals on the main page.
 *
 * @param periods {Array}
 */
function setTimes(periods) {
    let currentDate = new Date().getTime();

    if (currentDate > clockTimeToTimestamp("00:00")) {
        setPeriodTimes("Cabot-High");
    }

    for (let i = 0; i < periods.length; i++) {
        // Check for correct period to use
        if (currentDate < periods[i].time)
            break;

        if (i < periods.length - 1 && currentDate > periods[i + 1].time)
            continue;

        // Change period name if it is different
        if (periods[i].name !== document.getElementById("current-period").innerHTML)
            document.getElementById("current-period").innerHTML = periods[i].name;

        // Choose the correct period time
        let periodDate;
        if (i < periods.length - 1) {
            periodDate = periods[i + 1].time;
        } else {
            periodDate = periods[0].time;
        }

        // Calculate different times
        let hoursLeft = Math.floor((periodDate - currentDate) / 1000 / 60 / 60);
        let minutesLeft = Math.floor((periodDate - currentDate) / 1000 / 60);
        let secondsLeft = Math.abs((minutesLeft * 60) - Math.floor((periodDate - currentDate) / 1000));

        // console.debug(`Current date:        ${currentDate}`);
        // console.debug(`Period date:         ${periodDate}`);
        // console.debug(`Subtracted time:     ${periodDate - currentDate}`);
        // console.debug(`Hours left:          ${hoursLeft}`);
        // console.debug(`Minutes left:        ${minutesLeft}`);
        // console.debug(`Minutes left (hour): ${minutesLeft - hoursLeft * 60}`);
        // console.debug(`Seconds left:        ${secondsLeft}`);

        // Create the string for the 'time left until' element
        let timeLeftString = createTimeLeftString(hoursLeft, minutesLeft, secondsLeft, periods, i);

        if (document.getElementById("next-period-time").innerHTML !== timeLeftString)
            document.getElementById("next-period-time").innerHTML = timeLeftString;

        const dayEndTime = document.getElementById("day-end-time");

        // Set 'day left time' element text
        if (currentDate < periods[periods.length - 2].time) {
            hoursLeft = Math.floor((periods[periods.length - 2].time - currentDate) / 1000 / 60 / 60);
            minutesLeft = Math.floor((periods[periods.length - 2].time - currentDate) / 1000 / 60);
            secondsLeft = Math.abs((minutesLeft * 60) - Math.floor((periods[periods.length - 2].time - currentDate) / 1000));

            timeLeftString = createTimeLeftString(hoursLeft, minutesLeft, secondsLeft, periods, i);

            if (dayEndTime.innerHTML !== timeLeftString)
                dayEndTime.innerHTML = timeLeftString;
        } else {
            if (dayEndTime.innerHTML !== "It's the end of the school day! 🥳")
                dayEndTime.innerHTML = "It's the end of the school day! 🥳";
        }

        // Setup progress bar percent
        const progressbar = document.getElementById("day-finished-progress");
        const progressbarLabel = document.getElementById("day-finished-progress-label");
        const percent = ((currentDate - periods[1].time) / (periods[periods.length - 2].time - periods[1].time)) * 100;

        progressbar.value = percent.toFixed(2);
        progressbarLabel.innerHTML = (percent < 0 ? "Day Progress: 0%" : percent < 100 ? `Day Progress: ${percent.toFixed(2)}%` : "Day Progress: 100%");
    }
}

/**
 * Creates a string for how much time is left for something in hours, minutes, and seconds.
 *
 * @param hoursLeft {number}
 * @param minutesLeft {number}
 * @param secondsLeft {number}
 * @param periods {Array}
 * @param periodsIndex {number}
 * @returns {string}
 */
function createTimeLeftString(hoursLeft, minutesLeft, secondsLeft, periods, periodsIndex) {
    let timeLeftString = (hoursLeft > 0 ? hoursLeft + " hour" + (hoursLeft !== 1 ? "s" : "") + " and " : "");
    timeLeftString += (minutesLeft > 0 ? Math.round(minutesLeft - hoursLeft * 60) + " minute" + (minutesLeft !== 1 ? "s" : "") + " and " : "");
    timeLeftString += secondsLeft + " second" + (secondsLeft !== 1 ? "s" : "");
    timeLeftString += " left until " + (periodsIndex < periods.length - 1 ? periods[periodsIndex + 1].name : periods[0].name);

    return timeLeftString;
}

// TODO Make this use json files or user input for periods instead of presets.
/**
 *
 * (NOT FINISHED) Sets the timestamps for all the periods.
 *
 * @param periodSet {string} - Name of the JSON file or saved period set
 * @param customSet {boolean} - If the set given is a custom set
 * @returns {[{name: string, short: string, time: (RangeError|RangeErrorConstructor|*)},{name: string, short: string, time: (RangeError|RangeErrorConstructor|*)},{name: string, short: string, time: (RangeError|RangeErrorConstructor|*)},{name: string, short: string, time: (RangeError|RangeErrorConstructor|*)},{name: string, short: string, time: (RangeError|RangeErrorConstructor|*)},null,null,null,null,null,null,null,null,null]}
 */
function setPeriodTimes(periodSet, customSet = false) {
    // let data;

    if (!customSet) {
        fetch("res/classInfo/periods/" + periodSet + ".json")
            .then(response => response.json())
        // .then(json => console.log(json));
    } else {
        // use custom info.
    }

    return [
        {
            time: clockTimeToTimestamp("00:00"),
            name: "Before School",
            short: "Before School"
        },
        {
            time: clockTimeToTimestamp("07:50"),
            name: "Zero Hour",
            short: "Zero Hour"
        },
        {
            time: clockTimeToTimestamp("08:25"),
            name: "1st Period",
            short: "1st"
        },
        {
            time: clockTimeToTimestamp("09:18"),
            name: "2nd Period",
            short: "2nd"
        },
        {
            time: clockTimeToTimestamp("10:15"),
            name: "3rd Period",
            short: "3rd"
        },
        {
            time: clockTimeToTimestamp("11:09"),
            name: "First Lunch",
            short: "1st Lunch"
        },
        {
            time: clockTimeToTimestamp("11:15"),
            name: "First Lunch / 4A",
            short: "1st Lunch / 4A"
        },
        {
            time: clockTimeToTimestamp("11:47"),
            name: "4A / 4B Period",
            short: "4A / 4B"
        },
        {
            time: clockTimeToTimestamp("12:02"),
            name: "4B Period / Second Lunch",
            short: "4B / 2nd Lunch"
        },
        {
            time: clockTimeToTimestamp("12:37"),
            name: "5th Period",
            short: "5th"
        },
        {
            time: clockTimeToTimestamp("13:33"),
            name: "6th Period",
            short: "6th"
        },
        {
            time: clockTimeToTimestamp("14:29"),
            name: "7th Period",
            short: "7th"
        },
        {
            time: clockTimeToTimestamp("15:20"),
            name: "End of School Day",
            short: "School Dismissed"
        },
        {
            time: clockTimeToTimestamp("23:59"),
            name: "End of Day",
            short: "End of Day"
        }
    ];
}