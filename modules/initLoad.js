/*
 * Copyright (c) 2024. Elijah McCalley
 * All rights reserved.
 */

// import {setElementVisibilityWithScale} from "./animateItem.min.js";
import {setBackgroundVisibility} from "./settingsActions.min.js";

export {initLoad, firstLoad};

const ROOT_CSS = document.documentElement;
const ROOT_STYLESHEET = window.getComputedStyle(ROOT_CSS);

/**
 * Sets up the website for use.
 */
function initLoad() {
    // Sets up the website for the first time if uninitialized.
    // if (location.pathname === "/" && !localStorage.getItem("initialized"))
    if (!localStorage.getItem("initialized"))
        firstLoad();

    // Set theme preference settings
    const THEME_PREFERENCE = localStorage.getItem("theme-preference");
    const CUSTOM_COLORS = document.getElementById("theme-custom-colors");
    document.getElementById("theme-preference-" + THEME_PREFERENCE).setAttribute("selected", "");
    setElementVisibilityWithScale(CUSTOM_COLORS, THEME_PREFERENCE === "custom", 0);

    switch (THEME_PREFERENCE) {
        case "system":
            ROOT_CSS.style.setProperty("--bg-color", "");
            ROOT_CSS.style.setProperty("--fg-color", "");
            break;
        case "light":
            ROOT_CSS.style.setProperty("--bg-color", ROOT_STYLESHEET.getPropertyValue("--bg-light-color"));
            ROOT_CSS.style.setProperty("--fg-color", ROOT_STYLESHEET.getPropertyValue("--fg-light-color"));
            break;
        case "dark":
            ROOT_CSS.style.setProperty("--bg-color", ROOT_STYLESHEET.getPropertyValue("--bg-dark-color"));
            ROOT_CSS.style.setProperty("--fg-color", ROOT_STYLESHEET.getPropertyValue("--fg-dark-color"));
            break;
        case "custom":
            ROOT_CSS.style.setProperty("--bg-color", localStorage.getItem("custom-background-color"));
            ROOT_CSS.style.setProperty("--fg-color", localStorage.getItem("custom-foreground-color"));
            break;
        default:
            console.debug(`unknown option "${THEME_PREFERENCE}"`);
    }

    // Set the custom theme color values to boxes
    document.getElementById("theme-custom-background").value = localStorage.getItem("custom-background-color");
    document.getElementById("theme-custom-foreground").value = localStorage.getItem("custom-foreground-color");

    // Setup background image
    const BACKGROUND_IMAGE = document.getElementById("background-image");
    BACKGROUND_IMAGE.src = localStorage.getItem("background-data");
    setBackgroundVisibility(localStorage.getItem("background-enabled") === "true");
    if (localStorage.getItem("background-data") === "") {
        document.getElementById("toggle-background-button").setAttribute("disabled", "");
    }

    // Setup Universal Color
    const UNIVERSAL_COLOR_MODE = localStorage.getItem("universal-color-mode");
    document.getElementById("universal-color-" + UNIVERSAL_COLOR_MODE).setAttribute("selected", "");
    switch (UNIVERSAL_COLOR_MODE) {
        case "disabled":
            document.querySelector("meta[name='theme-color']").content = "#000000";
            break;
        case "background":
            document.querySelector("meta[name='theme-color']").content = ROOT_CSS.style.getPropertyValue("--bg-color");
            break;
        case "foreground":
            document.querySelector("meta[name='theme-color']").content = ROOT_CSS.style.getPropertyValue("--fg-color");
            break;
        default:
            console.debug(`unknown option "${UNIVERSAL_COLOR_MODE}"`);
    }

    // Setup event display count
    document.getElementById("event-display-count").value = localStorage.getItem("event-display-count");

    // Set the display text for tab timer mode button
    const TAB_TIMER_MODE_TOGGLE = document.getElementById("tab-timer-mode-toggle");
    switch (localStorage.getItem("tab-timer-mode")) {
        case "end-of-day":
            TAB_TIMER_MODE_TOGGLE.innerText = "End of day";
            break;
        case "next-period":
        default:
    }

    // Setup element visibility
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith("display-")) {
            const ELEMENT_ID = localStorage.key(i).substring(8);
            const ELEMENT_VISIBLE = localStorage.getItem(localStorage.key(i)) === "true";
            setSiteElementVisibility(ELEMENT_ID + "-toggle", ELEMENT_ID, ELEMENT_VISIBLE, 0);
        }
    }
}

/**
 * Sets up the website data for first time users.
 *
 * NOTE: When making FTS, be sure most settings are customizable from FTS.
 */
function firstLoad() {
    // Do first time setup if necessary.
    const SYSTEM_DARK_THEME = window.matchMedia('(prefers-color-scheme: dark)');

    if (SYSTEM_DARK_THEME.matches) {
        localStorage.setItem("custom-background-color", ROOT_STYLESHEET.getPropertyValue("--bg-dark-color"));
        localStorage.setItem("custom-foreground-color", ROOT_STYLESHEET.getPropertyValue("--fg-dark-color"));
    } else {
        localStorage.setItem("custom-background-color", ROOT_STYLESHEET.getPropertyValue("--bg-light-color"));
        localStorage.setItem("custom-foreground-color", ROOT_STYLESHEET.getPropertyValue("--fg-light-color"));
    }

    document.getElementById("theme-custom-background").value = localStorage.getItem("custom-background-color");
    document.getElementById("theme-custom-foreground").value = localStorage.getItem("custom-foreground-color");

    localStorage.setItem("theme-preference", "system");
    localStorage.setItem("background-enabled", false);
    localStorage.setItem("background-data", "");
    localStorage.setItem("universal-color-mode", "disabled");
    localStorage.setItem("event-display-count", "6");
    localStorage.setItem("display-day-end-time", true);
    localStorage.setItem("display-upcoming-events", true);
    localStorage.setItem("display-site-message", true);
    localStorage.setItem("display-changelog-box", true);
    localStorage.setItem("tab-timer-mode", "next-period");

    localStorage.setItem("initialized", "1");
}
