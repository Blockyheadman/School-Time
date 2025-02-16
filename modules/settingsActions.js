/*
 * Copyright (c) 2024. Elijah McCalley
 * All rights reserved.
 */

/*
 * This file is to be used only for the main page since it just deals with settings changes.
 */

import {setElementVisibility, setElementVisibilityWithScale} from "./animateItem.min.js";
import {firstLoad, initLoad} from "./initLoad.min.js";

export {setBackgroundVisibility, toggleBackgroundVisibility, setSiteElementVisibility, toggleSiteElementVisibility};

const BACKGROUND_COLOR_BOX = document.getElementById("theme-custom-background");
const FOREGROUND_COLOR_BOX = document.getElementById("theme-custom-foreground");
const BACKGROUND_SELECTOR = document.getElementById("background-selector");
const SETTINGS_IMPORT = document.getElementById("settings-import");


BACKGROUND_COLOR_BOX.addEventListener("input", setThemeColor);
FOREGROUND_COLOR_BOX.addEventListener("input", setThemeColor);
BACKGROUND_SELECTOR.addEventListener("change", setBackground);
SETTINGS_IMPORT.addEventListener("change", importSettings);

/**
 * Callback function to set the theme color in local storage.
 *
 * @param event {Event} - The event data.
 */
function setThemeColor(event) {
    const TARGET_ELEMENT = event.target;
    const CSS_ROOT = document.documentElement;

    const SELECTED_CSS_COLOR = TARGET_ELEMENT.id.includes("back" || TARGET_ELEMENT.id.includes("background"))
        ? "--bg-color" : "--fg-color";
    const LOCAL_STORAGE_COLOR = SELECTED_CSS_COLOR === "--bg-color" ? "custom-background-color" : "custom-foreground-color";

    // test if css supports the color or if it matches custom hex regex support for without '#'
    if (CSS.supports("color", TARGET_ELEMENT.value)) {
        CSS_ROOT.style.setProperty(SELECTED_CSS_COLOR, TARGET_ELEMENT.value);
        localStorage.setItem(LOCAL_STORAGE_COLOR, TARGET_ELEMENT.value);
    } else if (/^([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})$/.test(TARGET_ELEMENT.value)) {
        const ACTUAL_HEX = "#" + TARGET_ELEMENT.value;
        TARGET_ELEMENT.value = "#" + TARGET_ELEMENT.value;
        CSS_ROOT.style.setProperty(SELECTED_CSS_COLOR, ACTUAL_HEX);
        localStorage.setItem(LOCAL_STORAGE_COLOR, ACTUAL_HEX);
    } else {
        CSS_ROOT.style.setProperty(SELECTED_CSS_COLOR, "");
        localStorage.setItem(LOCAL_STORAGE_COLOR, "");
    }
}

/**
 * Sets the theme preference setting.
 *
 * @param newValue {string} - The new value to set for the theme
 */
function setThemePreference(newValue = "default") {
    const CUSTOM_COLORS = document.getElementById("theme-custom-colors");
    // const CUSTOM_COLORS_CHILD = CUSTOM_COLORS.children[0];
    const THEME_PREFERENCE_SELECTOR = document.getElementById("theme-preference");

    if (newValue === "default") {
        const SELECTED_CHILD = THEME_PREFERENCE_SELECTOR.children.item(THEME_PREFERENCE_SELECTOR.selectedIndex);
        newValue = SELECTED_CHILD.value;
        localStorage.setItem("theme-preference", newValue);
    } else {
        if (
            newValue === "system"
            || newValue === "light"
            || newValue === "dark"
            || newValue === "custom"
        ) {
            THEME_PREFERENCE_SELECTOR.value = newValue;
            localStorage.setItem("theme-preference", newValue);
        }
    }

    setElementVisibilityWithScale(CUSTOM_COLORS, newValue === "custom");

    const CSS_ROOT = document.documentElement;
    const ORIGINAL_ROOT = window.getComputedStyle(CSS_ROOT);

    switch (newValue) {
        case "system":
            // const USER_DARK_ENABLED = window.matchMedia("(prefers-color-scheme: dark)").matches;
            CSS_ROOT.style.setProperty("--bg-color", "");
            CSS_ROOT.style.setProperty("--fg-color", "");
            break;
        case "light":
            CSS_ROOT.style.setProperty("--bg-color", ORIGINAL_ROOT.getPropertyValue("--bg-light-color"));
            CSS_ROOT.style.setProperty("--fg-color", ORIGINAL_ROOT.getPropertyValue("--fg-light-color"));
            break;
        case "dark":
            CSS_ROOT.style.setProperty("--bg-color", ORIGINAL_ROOT.getPropertyValue("--bg-dark-color"));
            CSS_ROOT.style.setProperty("--fg-color", ORIGINAL_ROOT.getPropertyValue("--fg-dark-color"));
            break;
        case "custom":
            CSS_ROOT.style.setProperty("--bg-color", localStorage.getItem("custom-background-color"));
            CSS_ROOT.style.setProperty("--fg-color", localStorage.getItem("custom-foreground-color"));
            break;
        default:
            console.debug(`unknown option "${newValue}"`);
            CSS_ROOT.style.setProperty("--bg-color", "");
            CSS_ROOT.style.setProperty("--fg-color", "");
    }
}

/**
 * Set's the background data to be displayed.
 *
 * @param data {string} - (Optional) The background data to feed in
 * @param enable {boolean} - (Optional) Whether to enable the background or not
 */
function setBackground(data, enable = true) {
    if (data.length === undefined) {
        const FILE = BACKGROUND_SELECTOR.files[0];
        const FILE_READER = new FileReader();
        FILE_READER.addEventListener("load", () => {
            if (FILE.size >= 2621440) {
                // if file size is bigger than 2.5Mib (Mebibytes)
                alert("This file exceeds the storage quota. Please try a smaller image.");
                return;
            } else if (FILE.size > 1572864) {
                // if file size is bigger than 1.5Mib (Mebibytes)
                alert("This file is quite large.. Consider compressing the image or using a smaller sized picture.");
            }

            setBackgroundData(FILE_READER.result, enable);
        });
        FILE_READER.readAsDataURL(FILE);

    } else {
        if (data.length >= 2621440) {
            alert("The background data exceeds the storage quota. Please try a smaller image.");
            return;
        } else if (data.length >= 1572864) {
            alert("This file is quite large.. Consider compressing the image or using a smaller sized picture.");
        }

        setBackgroundData(data, enable);
    }

}

/**
 * Sets the background data and enables the background.
 *
 * Helper function to *setBackground()*
 *
 * @param data {string} - The Base64 string data
 * @param enable {boolean} - Whether to enable the background or not
 */
function setBackgroundData(data, enable = true) {
    try {
        window.atob(data.substring(22, data.length - 1));
    } catch (e) {
        console.error(e.message);
        return;
    }

    localStorage.setItem("background-data", data);
    localStorage.setItem("background-enabled", enable);
    const BACKGROUND_IMAGE = document.getElementById("background-image");
    BACKGROUND_IMAGE.src = data;
    if (enable === true) {
        const THEME_PREFERENCE_SELECTOR = document.getElementById("theme-preference");
        THEME_PREFERENCE_SELECTOR.value = "dark";
        setThemePreference();
    }
    if (data !== "") {
        document.getElementById("toggle-background-button").removeAttribute("disabled");
    } else {
        document.getElementById("toggle-background-button").setAttribute("disabled", "");
    }
    setBackgroundVisibility(enable);

    console.debug("Successfully set background data!")
}

/**
 * Toggles the main page background visibility.
 */
function toggleBackgroundVisibility() {
    setBackgroundVisibility(localStorage.getItem("background-enabled") !== "true");
}

/**
 * Sets the background visibility.
 *
 * @param makeVisible {boolean} - If the background should be made visible
 */
function setBackgroundVisibility(makeVisible) {
    const BACKGROUND_IMAGE = document.getElementById("background-image");
    const BACKGROUND_TOGGLE_BUTTON = document.getElementById("toggle-background-button");

    localStorage.setItem("background-enabled", makeVisible);
    BACKGROUND_TOGGLE_BUTTON.innerText = "Toggle BG: " + (makeVisible ? "On" : "Off");
    setElementVisibility(BACKGROUND_IMAGE, makeVisible);
}

/**
 * Clear's the background data and hides the background.
 */
function clearBackground() {
    document.getElementById("toggle-background-button").setAttribute("disabled", "");
    localStorage.setItem("background-data", "");
    localStorage.setItem("background-enabled", false);
    setBackgroundVisibility(false);
}

/**
 * Sets the Universal Color mode.
 *
 * @param newValue {string} - An optional value to set the value manually
 */
function setUniversalColorMode(newValue = "default") {
    const CSS_ROOT = document.documentElement;
    const UNIVERSAL_COLOR_PICKER = document.getElementById("universal-color");

    if (newValue === "default") {
        const SELECTED_CHILD = UNIVERSAL_COLOR_PICKER.children.item(UNIVERSAL_COLOR_PICKER.selectedIndex);
        newValue = SELECTED_CHILD.value;
        localStorage.setItem("universal-color-mode", newValue);
    } else {

        if (newValue === "disabled" || newValue === "background" || newValue === "foreground") {
            UNIVERSAL_COLOR_PICKER.value = newValue;
            localStorage.setItem("universal-color-mode", newValue);
        }
    }

    switch (newValue) {
        case "disabled":
            document.querySelector("meta[name='theme-color']").content = "#000000";
            break;
        case "background":
            document.querySelector("meta[name='theme-color']").content = CSS_ROOT.style.getPropertyValue("--bg-color");
            break;
        case "foreground":
            document.querySelector("meta[name='theme-color']").content = CSS_ROOT.style.getPropertyValue("--fg-color");
            break;
        default:
            console.debug(`unknown option "${newValue}"`);
    }
}

/**
 * Sets the tab timer mode.
 *
 * @param newMode {string} - The new mode id to set to. Leave as 'default' to auto adjust.
 */
function setTabTimerMode(newMode = "default") {
    const TAB_TIMER_TOGGLE = document.getElementById("tab-timer-mode-toggle");
    if (newMode === "default") {
        newMode = localStorage.getItem("tab-timer-mode");

        switch (newMode) {
            case "end-of-day":
                localStorage.setItem("tab-timer-mode", "next-period");
                TAB_TIMER_TOGGLE.innerText = "Next Period";
                break;
            case "next-period":
            default:
                localStorage.setItem("tab-timer-mode", "end-of-day");
                TAB_TIMER_TOGGLE.innerText = "End of day";
        }
    } else {
        switch (newMode) {
            case "end-of-day":
                localStorage.setItem("tab-timer-mode", "end-of-day");
                TAB_TIMER_TOGGLE.innerText = "End of day";
                break;
            case "next-period":
            default:
                localStorage.setItem("tab-timer-mode", "next-period");
                TAB_TIMER_TOGGLE.innerText = "Next Period";
        }
    }
}

/**
 * Toggles a site element's visibility on or off.
 *
 * @param buttonId {string} - The button that called this action.
 * @param elementId {string} - The element to toggle visibility on.
 * @param transitionSpeedMs {number} - The speed of the transition in milliseconds.
 */
function toggleSiteElementVisibility(buttonId, elementId, transitionSpeedMs = 250) {
    const ELEMENT = document.getElementById(elementId);
    const ELEMENT_VISIBLE = ELEMENT.style.getPropertyValue("display") !== "none"
    setSiteElementVisibility(buttonId, elementId, !ELEMENT_VISIBLE, transitionSpeedMs);
}

/**
 * Sets a site element's visibility on or off.
 *
 * @param buttonId {string} - The button that called this action.
 * @param elementId {string} - The element to toggle visibility on.
 * @param makeVisible {boolean} - If the element should be made visible or not.
 * @param transitionSpeedMs {number} - The speed of the transition in milliseconds.
 */
function setSiteElementVisibility(buttonId, elementId, makeVisible, transitionSpeedMs = 250) {
    const BUTTON = document.getElementById(buttonId);
    BUTTON.innerText = (makeVisible ? "Visible" : "Hidden");
    const ELEMENT = document.getElementById(elementId);
    localStorage.setItem("display-" + elementId, makeVisible);
    setElementVisibility(ELEMENT, makeVisible, transitionSpeedMs);
}

/**
 * Exports the user's settings into a json file ^^
 */
function exportSettings() {
    const testJson = {
        theme: localStorage.getItem("theme-preference"),
        universalColorMode: localStorage.getItem("universal-color-mode"),
        backgroundColor: localStorage.getItem("custom-background-color"),
        foregroundColor: localStorage.getItem("custom-foreground-color"),
        backgroundImage: {
            data: localStorage.getItem("background-data"),
            enabled: localStorage.getItem("background-enabled")
        },
        eventDisplayCount: localStorage.getItem("event-display-count"),
        tabTimerMode: localStorage.getItem("tab-timer-mode"),
        visibleElements: {
            dayEndTime: localStorage.getItem("display-day-end-time"),
            upcomingEvents: localStorage.getItem("display-upcoming-events"),
            siteMessage: localStorage.getItem("display-site-message"),
            changelogBox: localStorage.getItem("display-changelog-box")
        }
    };
    const stringTestJson = JSON.stringify(testJson, null, 4);

    // Create an element to download the file after creation.
    const temp = document.createElement('a');
    temp.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(stringTestJson));
    temp.setAttribute("download", "schooling-hours-settings.json");
    temp.style.display = "none";
    document.body.appendChild(temp);
    temp.click();
    document.body.removeChild(temp);
}

/**
 * Imports user settings from a json file ^^
 */
function importSettings() {
    const FILE = SETTINGS_IMPORT.files[0];
    console.debug(FILE);

    const FILE_READER = new FileReader();
    FILE_READER.addEventListener("load", async () => {
        const DATA = FILE_READER.result
        const JSON_DATA = JSON.parse(DATA);
        console.debug(JSON_DATA);
        // Set settings on localStorage

        if (!CSS.supports("color", JSON_DATA.backgroundColor)) {
            alert(`Incorrect value '${JSON_DATA.backgroundColor}'`)
            console.error(`Incorrect value '${JSON_DATA.backgroundColor}'`)
            return;
        }
        localStorage.setItem("custom-background-color", JSON_DATA.backgroundColor);

        if (!CSS.supports("color", JSON_DATA.foregroundColor)) {
            alert(`Incorrect value '${JSON_DATA.foregroundColor}'`)
            console.error(`Incorrect value '${JSON_DATA.foregroundColor}'`)
            return;
        }
        localStorage.setItem("custom-foreground-color", JSON_DATA.foregroundColor);

        if (
            JSON_DATA.theme !== "system"
            && JSON_DATA.theme !== "light"
            && JSON_DATA.theme !== "dark"
            && JSON_DATA.theme !== "custom"
        ) {
            alert(`Incorrect value '${JSON_DATA.theme}'`)
            console.error(`Incorrect value '${JSON_DATA.theme}'`)
            return;
        }
        setThemePreference(JSON_DATA.theme);

        if (
            JSON_DATA.universalColorMode !== "disabled"
            && JSON_DATA.universalColorMode !== "background"
            && JSON_DATA.universalColorMode !== "foreground"
        ) {
            alert(`Incorrect value '${JSON_DATA.universalColorMode}'`)
            console.error(`Incorrect value '${JSON_DATA.universalColorMode}'`)
            return;
        }
        setUniversalColorMode(JSON_DATA.universalColorMode);

        if (typeof convertToNormalType(JSON_DATA.backgroundImage.enabled) !== "boolean") {
            alert(`Incorrect value '${JSON_DATA.backgroundImage.enabled}'`)
            console.error(`Incorrect value '${JSON_DATA.backgroundImage.enabled}'`)
            return;
        } else if (JSON_DATA.backgroundImage.enabled === "true") {
            setBackground(JSON_DATA.backgroundImage.data);
        } else if (JSON_DATA.backgroundImage.data.length !== 0) {
            setBackground(JSON_DATA.backgroundImage.data, false);
        } else {
            setBackground("", false);
        }

        if (typeof convertToNormalType(JSON_DATA.eventDisplayCount) !== "number") {
            alert(`Incorrect value '${JSON_DATA.eventDisplayCount}'`)
            console.error(`Incorrect value '${JSON_DATA.eventDisplayCount}'`)
            return;
        }
        await setEventCount(convertToNormalType(JSON_DATA.eventDisplayCount));

        if (
            JSON_DATA.tabTimerMode !== "next-period"
            && JSON_DATA.tabTimerMode !== "end-of-day"
        ) {
            alert(`Incorrect value '${JSON_DATA.tabTimerMode}'`)
            console.error(`Incorrect value '${JSON_DATA.tabTimerMode}'`)
            return;
        }
        setTabTimerMode(JSON_DATA.tabTimerMode);

        for (const parentKey in JSON_DATA.visibleElements) {
            const ELEMENT_NAME = "display-" + parentKey.replaceAll(/([A-Z])/g, (match) =>
                "-" + match.toLowerCase()
            );
            localStorage.setItem(ELEMENT_NAME, JSON_DATA.visibleElements[parentKey]);
        }

        initLoad();
    });
    FILE_READER.readAsText(FILE);
    SETTINGS_IMPORT.type = "text";
    SETTINGS_IMPORT.type = "file";
}

async function resetSettings() {
    if (!window.confirm("Are you sure you want to reset your settings?")) {
        return;
    }

    firstLoad();

    const THEME_PREFERENCE_SELECTOR = document.getElementById("theme-preference");
    THEME_PREFERENCE_SELECTOR.value = "system";
    setThemePreference();

    document.getElementById("theme-custom-background").value = localStorage.getItem("custom-background-color");
    document.getElementById("theme-custom-foreground").value = localStorage.getItem("custom-foreground-color");

    clearBackground();

    const UNIVERSAL_COLOR_SELECTOR = document.getElementById("universal-color");
    UNIVERSAL_COLOR_SELECTOR.value = "disabled";
    setUniversalColorMode();

    const EVENT_COUNT_INPUT = document.getElementById("event-display-count");
    EVENT_COUNT_INPUT.value = Math.floor(parseInt(EVENT_COUNT_INPUT.max) - parseInt(EVENT_COUNT_INPUT.min));
    await setEventCount();

    setTabTimerMode("next-period");

    setSiteElementVisibility("day-end-time-toggle", "day-end-time", true);
    setSiteElementVisibility("upcoming-events-toggle", "upcoming-events", true);
    setSiteElementVisibility("site-message-toggle", "site-message", true);
    setSiteElementVisibility("changelog-box-toggle", "changelog-box", true);
}

window.setThemePreference = setThemePreference;
window.toggleBackgroundVisibility = toggleBackgroundVisibility;
window.setBackgroundVisibility = setBackgroundVisibility;
window.clearBackground = clearBackground;
window.setUniversalColorMode = setUniversalColorMode;
window.setTabTimerMode = setTabTimerMode;
window.toggleSiteElementVisibility = toggleSiteElementVisibility;
window.setSiteElementVisibility = setSiteElementVisibility;
window.exportSettings = exportSettings;
window.resetSettings = resetSettings;

/**
 * Transforms the data from a string to it's 'normal type' (int, boolean, etc.)
 * @param inputData {string} - The data to transform.
 *
 * @returns The same data under it's 'normal type'
 */
function convertToNormalType(inputData) {
    if (inputData === "true" || inputData === "false") {
        return inputData === "true";
    } else if (!isNaN(Number(inputData))) {
        return Number(inputData);
    }
    return inputData;
}