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
 * @param eventCount {number} - The number of events to show.
 */
function setupEvents(eventSet, eventSetType, eventCount) {
    if (!eventSet) {
        throw new ReferenceError("Missing parameter \"eventSet\"");
    }
    if (!eventSetType) {
        throw new ReferenceError("Missing parameter \"eventSetType\"");
    }
    if (!eventCount) {
        throw new ReferenceError("Missing parameter \"eventCount\"");
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

    let eventShift = 0;
    for (let i = 0; i < eventCount + eventShift; i++) {
        if (i + 1 > eventCount + eventShift)
            break;

        const EVENT_DATA = eventSet[i];
        if (i >= eventSet.length) {
            eventTable.innerHTML += "<tr><td><wbr></td><td><wbr></td></tr>";
            continue;
        }
        const DAYS_LEFT = Math.floor((EVENT_DATA.date - CURRENT_DATE.getTime()) / 86500000);

        if (DAYS_LEFT >= 0) {
            let rowData = "<tr><td>";
            rowData += EVENT_DATA.name;
            rowData += "</td><td>";

            if (DAYS_LEFT >= 1) {
                rowData += DAYS_LEFT;
                rowData += " days";
            } else if (DAYS_LEFT === 0) {
                rowData += "Today";
            }

            rowData += "</td></tr>";

            if (EVENT_DATA.special) {
                if (EVENT_DATA.special.endDate && i + 1 < eventCount + eventShift) {
                    const DAYS_LEFT = Math.floor((EVENT_DATA.special.endDate - CURRENT_DATE.getTime()) / 86500000);

                    rowData += "<tr><td>";
                    rowData += EVENT_DATA.name + " ends";
                    rowData += "</td><td>";

                    if (DAYS_LEFT >= 1) {
                        rowData += DAYS_LEFT;
                        rowData += " days";
                    } else if (DAYS_LEFT === 0) {
                        rowData += "Today";
                    }

                    rowData += "</td></tr>";
                    i++;
                }
            }

            eventTable.innerHTML += rowData;
        } else {
            eventShift++;
        }

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