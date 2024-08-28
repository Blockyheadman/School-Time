/*
 * Copyright (c) 2024. Elijah McCalley
 * All rights reserved.
 */

import {initLoad} from "./modules/initLoad.min.js";
import {getPeriodTimes, setupTimes} from "./modules/timeSetup.min.js";
import {getEvents, setupEvents} from "./modules/eventSetup.min.js";

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

// The list of periods from a given school
let periods = await getPeriodTimes("Cabot-High");
let studentCalendarEvents = await getEvents("Cabot-High", "studentCalendar")
let extraEvents = await getEvents("Cabot-High", "extra")

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
        studentCalendarEvents = await getEvents("Cabot-High", "studentCalendar")
        extraEvents = await getEvents("Cabot-High", "extra")
    }

    setupTimes(periods);
    setupEvents(studentCalendarEvents, "studentCalendar");
    setupEvents(extraEvents, "extra");

    const currentTime = new Date();
    currentTime.setMilliseconds(0);

    // if (Notification.permission === "granted" && !document.hasFocus()) {
    //     if (currentTime.getTime() === periods[getCurrentPeriodIndex()].time && currentTime.getTime() >= periods[1].time
    //         && getCurrentPeriodIndex() < periods.length - 1) {
    //         let currentPeriodText = "It's ";
    //         if (getCurrentPeriodIndex() < periods.length - 2) {
    //             currentPeriodText += `now ${periods[getCurrentPeriodIndex()].name}`;
    //         } else {
    //             currentPeriodText += "the end of the school day! 🥳";
    //         }
    //
    //         navigator.serviceWorker.ready.then((registration) => {
    //             registration.showNotification(
    //                 "Schooling Hours",
    //                 {
    //                     body: currentPeriodText,
    //                     icon: "res/icons/hd_512.png",
    //                     tag: `pindex${getCurrentPeriodIndex()}`
    //                 }
    //             )
    //         })
    //     }
    // }
}

await updateTimes();

// Main loop for updating times
setInterval(updateTimes, 500, periods);