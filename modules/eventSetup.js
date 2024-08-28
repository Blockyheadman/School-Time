/*
 * Copyright (c) 2024. Elijah McCalley
 * All rights reserved.
 */

const EVENT_TYPE = Object.freeze({
    STUDENT_CALENDAR: Symbol("studentCalendar"),
    EXTRA: Symbol("extra")
});

import {clockTimeToTimestamp, dateTimeToTimestamp} from "./timeConversion.min.js";

export {getEvents, setupEvents};

/**
 * Sets the specified event visuals on the main page.
 *
 * @param eventSet {Array<*>} - The set of events to modify.
 * @param eventSetType {string} - The type of event list.
 */
function setupEvents(eventSet, eventSetType) {
    if (!eventSet) {
        throw new ReferenceError("Missing parameter \"eventSet\"");
    }
    if (!eventSetType) {
        throw new ReferenceError("Missing parameter \"eventSetType\"");
    }

    let eventTable;

    if (eventSetType === EVENT_TYPE.STUDENT_CALENDAR.description) {
        eventTable = document.getElementById("events-student-calendar")
    } else if (eventSetType === EVENT_TYPE.EXTRA.description) {
        eventTable = document.getElementById("events-extra")
    } else {
        throw new Error(`Incorrect type "${eventSetType}"`);
    }

    eventTable.innerText = "";

    const CURRENT_DATE = new Date();
    for (let i = 0; i < 6; i++) {
        const EVENT_DATA = eventSet[i];

        let rowData = "<tr><td>";
        rowData += EVENT_DATA.name;
        rowData += "</td><td>";

        rowData += Math.floor((EVENT_DATA.date - CURRENT_DATE.getTime()) / 86500000);
        rowData += " days";

        rowData += "</td></tr>";
        eventTable.innerHTML += rowData;
    }
}

/**
 * Gets the event list based on info given.
 *
 * @param eventSetName {string} - The name of the JSON file.
 * @param eventSetType {string} - The type of event list.
 * @returns {Promise<*>} - An array of events of the given type.
 */
async function getEvents(eventSetName, eventSetType) {
    if (!eventSetName) {
        throw new ReferenceError("Missing parameter \"eventSet\"");
    }
    if (!eventSetType) {
        throw new ReferenceError("Missing parameter \"eventSetType\"");
    }

    const eventsPath = "res/classInfo/events"

    let fetchResponse;
    if (eventSetType === EVENT_TYPE.STUDENT_CALENDAR.description) {
        fetchResponse = fetch(`${eventsPath}/${eventSetType}/${eventSetName}.json`)
            .then(response => response.json())
    } else if (eventSetType === EVENT_TYPE.EXTRA.description) {
        fetchResponse = fetch(`${eventsPath}/${eventSetType}/${eventSetName}.json`)
            .then(response => response.json())
    } else {
        throw new ReferenceError(`Invalid event type "${eventSetType}".`)
    }

    fetchResponse.then(data => {
        // handle data here
        for (let i = 0; i < data.length; i++) {
            // Optional data transformation
            if (data[i].special) {
                if (data[i].special.endDate) {
                    data[i].special.endDate = dateTimeToTimestamp(data[i].special.endDate);
                }

                if (data[i].special.earlyDismissal) {
                    data[i].special.earlyDismissal = clockTimeToTimestamp(data[i].special.earlyDismissal);
                }

                if (data[i].special.time) {
                    let timeString = data[i].special.time
                    const SPLIT_TIMES = timeString.split("-")

                    if (SPLIT_TIMES.length === 1) {
                        throw new Error("Time range must be split using a '-'");
                    }

                    timeString = dateTimeToTimestamp(data[i].date, SPLIT_TIMES[0])
                    timeString += "-"
                    timeString += dateTimeToTimestamp(data[i].date, SPLIT_TIMES[0])
                }
            }
            // Required data transformation
            if (!data[i].name) {
                throw new Error(`No 'name' property specified in event item ${i}`);
            }
            if (!data[i].date) {
                throw new Error(`No 'date' property specified in event item ${i}`);
            } else {
                data[i].date = dateTimeToTimestamp(data[i].date);
            }
        }
    })

    return fetchResponse;
}