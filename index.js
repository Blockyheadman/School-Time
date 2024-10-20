/*
 * Copyright (c) 2024. Elijah McCalley
 * All rights reserved.
 */

import {initLoad} from "./modules/initLoad.min.js";
import {getPeriodTimes, setupTimes} from "./modules/timeSetup.min.js";
import {getEvents, setupEvents} from "./modules/eventSetup.min.js";
import {CLOCK_TIME_REGEX, clockTimeToTimestamp} from "./modules/timeConversion.min.js";

if (navigator.serviceWorker) {
    window.addEventListener("load", async function () {
        try {
            const SW_REGISTRATION = await navigator.serviceWorker.register("./serviceWorker.min.js");

            if (SW_REGISTRATION.installing) {
                console.debug("Installing service worker..");
            } else if (SW_REGISTRATION.waiting) {
                console.debug("Service worker has been installed!");
            } else if (SW_REGISTRATION.active) {
                console.debug("Service worker is active!");
            }
        } catch (err) {
            console.error(`Registration failed with ${err}`);
        }
    });
}

// Setup main website
initLoad();

// Get version and changelog
const CURRENT_VERSION = await getVersion();
const CURRENT_VERSION_STRING = await getVersionString();
await setupChangelog();

// The list of periods and events from a given school
let periods = await getPeriodTimes("Cabot-High");
let studentCalendarEvents = await getEvents("Cabot-High", "studentCalendar")
let extraEvents = await getEvents("Cabot-High", "extra")

// The custom checkout time if applicable
let customCheckout = NaN;
let eventCount = Number.parseInt(localStorage.getItem("event-display-count"));

// Example for saving to cache the events
// if (window.caches) {
//     caches.open("test-cache").then((cache) => {
//         cache.addAll(["/res/classInfo/events/extra/Cabot-High.json"]);
//     });
// }

/**
 * Updates the times on the page and resets the timestamps if a new day has come.
 * @returns {Promise<void>}
 */
async function updateTimes() {
    const date = new Date();
    const morningDate = new Date(periods[0].time);
    if (date.getDate() > morningDate.getDate()) {
        periods = await getPeriodTimes("Cabot-High");
        studentCalendarEvents = await getEvents("Cabot-High", "studentCalendar");
        extraEvents = await getEvents("Cabot-High", "extra");

        resetCheckoutTime();
    }

    setupTimes(periods, customCheckout);
    setupEvents(studentCalendarEvents, "studentCalendar", eventCount);
    setupEvents(extraEvents, "extra", eventCount);

    const currentTime = new Date();
    currentTime.setMilliseconds(0);

    /*
    if (Notification.permission === "granted" && !document.hasFocus()) {
        if (currentTime.getTime() === periods[getCurrentPeriodIndex()].time && currentTime.getTime() >= periods[1].time
            && getCurrentPeriodIndex() < periods.length - 1) {
            let currentPeriodText = "It's ";
            if (getCurrentPeriodIndex() < periods.length - 2) {
                currentPeriodText += `now ${periods[getCurrentPeriodIndex()].name}`;
            } else {
                currentPeriodText += "the end of the school day! 🥳";
            }

            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(
                    "Schooling Hours",
                    {
                        body: currentPeriodText,
                        icon: "res/icons/hd_512.png",
                        tag: `pindex${getCurrentPeriodIndex()}`
                    }
                )
            })
        }
    }
    */
}

await updateTimes();

// Main loop for updating times
setInterval(updateTimes, 500, periods);

async function setupChangelog() {
    document.getElementById('changelog-box-button').innerText = "Version " + CURRENT_VERSION_STRING;

    const CHANGELOG_LIST = document.getElementById("changelog-list");
    let changelogDetails = await fetch("res/version.json")
        .then(response => response.json())
        .then(json => json.changelog);

    for (let i = 0; i < changelogDetails.length; i++) {
        CHANGELOG_LIST.innerHTML += `<li>${changelogDetails[i]}</li>`;
    }
}

/**
 * Gets the version json
 * @returns {Promise<{major: number, minor: number, patch: number, typeShort: string}>}
 */
async function getVersion() {
    return await fetch("res/version.json")
        .then(response => response.json())
        .then(json => json.version);
}

/**
 * Gets the version as a string
 * @returns {Promise<string>}
 */
async function getVersionString() {
    return await getVersion()
        .then(data => {
            return `${data.major}.${data.minor}.${data.patch}${data.typeShort}`;
        });
}

/**
 * Decides when to show the 'update available' button.
 * @returns {Promise<void>}
 */
async function checkForUpdate() {
    let versionResponse = await getVersion();

    const VersionTypeRatings = Object.freeze({
        ALPHA: 1,
        BETA: 2,
        RELEASE_CANDIDATE: 3,
        RELEASE: 4
    });

    const CURRENT_VERSION_TYPE_RATING = (() => {
        switch (CURRENT_VERSION.typeShort.toLowerCase()) {
            case 'a':
                return VersionTypeRatings.ALPHA;
            case 'b':
                return VersionTypeRatings.BETA;
            case 'rc':
                return VersionTypeRatings.RELEASE_CANDIDATE
            default:
                return VersionTypeRatings.RELEASE;
        }
    })();

    const VERSION_RESPONSE_TYPE_RATING = (() => {
        switch (versionResponse.typeShort.toLowerCase()) {
            case 'a':
                return VersionTypeRatings.ALPHA;
            case 'b':
                return VersionTypeRatings.BETA;
            case 'rc':
                return VersionTypeRatings.RELEASE_CANDIDATE
            default:
                return VersionTypeRatings.RELEASE;
        }
    })();

    if (
        versionResponse.major > CURRENT_VERSION.major ||
        versionResponse.minor > CURRENT_VERSION.minor ||
        versionResponse.patch > CURRENT_VERSION.patch ||
        (CURRENT_VERSION_TYPE_RATING === VersionTypeRatings.RELEASE
            && VERSION_RESPONSE_TYPE_RATING < CURRENT_VERSION_TYPE_RATING) ||
        VERSION_RESPONSE_TYPE_RATING > CURRENT_VERSION_TYPE_RATING
    ) {
        setElementVisibility(document.getElementById("update-button"), true);
    } else {
        setElementVisibility(document.getElementById("update-button"), false);
    }
}

// Loop for checking updates
setInterval(checkForUpdate, 15000);

/**
 * Sets the custom checkout time.
 */
function setCheckoutTime() {
    const INPUT_BOX = document.getElementById("early-checkout-input");

    if (CLOCK_TIME_REGEX.test(INPUT_BOX.value)) {
        customCheckout = clockTimeToTimestamp(INPUT_BOX.value);
    } else {
        INPUT_BOX.value = "Incorrect format";
    }
}

/**
 * Resets the custom checkout time.
 */
function resetCheckoutTime() {
    document.getElementById("early-checkout-input").value = "";
    customCheckout = NaN;
}

/**
 * Sets and constrains the visible event count
 * @returns {Promise<void>}
 */
async function setEventCount() {
    const EVENT_COUNT_INPUT = document.getElementById("event-display-count");
    let newEventCount = Number.parseInt(EVENT_COUNT_INPUT.value);
    if (!isNaN(newEventCount)) {
        if (newEventCount < EVENT_COUNT_INPUT.min) {
            EVENT_COUNT_INPUT.value = EVENT_COUNT_INPUT.min;
            newEventCount = parseInt(EVENT_COUNT_INPUT.min);
        } else if (newEventCount > EVENT_COUNT_INPUT.max) {
            EVENT_COUNT_INPUT.value = EVENT_COUNT_INPUT.max;
            newEventCount = parseInt(EVENT_COUNT_INPUT.max);
        }

        localStorage.setItem("event-display-count", newEventCount);
        eventCount = newEventCount;

        await updateTimes();
    }
}

/**
 * Toggles the visibility of the changelog box.
 */
function toggleChangelogBox() {
    const CHANGELOG_BOX = document.getElementById('changelog-box');
    const CHANGELOG_BOX_BUTTON = document.getElementById('changelog-box-button');
    const CHANGELOG_BOX_TEXT = document.getElementById('changelog-box-text');
    if (CHANGELOG_BOX.classList.contains('opened')) {
        CHANGELOG_BOX.classList.remove('opened');
        CHANGELOG_BOX_BUTTON.innerText = "Version " + CURRENT_VERSION_STRING;
        setElementVisibilityWithScale(CHANGELOG_BOX_TEXT, false, 450);
    } else {
        CHANGELOG_BOX.classList.add('opened');
        CHANGELOG_BOX_BUTTON.innerText = "Close";
        setElementVisibilityWithScale(CHANGELOG_BOX_TEXT, true, 450);
    }
}

window.setCheckoutTime = setCheckoutTime;
window.resetCheckoutTime = resetCheckoutTime;
window.setEventCount = setEventCount;
window.toggleChangelogBox = toggleChangelogBox;