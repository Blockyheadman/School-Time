/*
 * Copyright (c) 2024. Elijah McCalley
 * All rights reserved.
 */

/*
 * This file is to be used only for the main page since it just deals with settings changes.
 */

import {setElementVisibility, setElementVisibilityWithScale} from "./animateItem.min.js";
import {firstLoad} from "./initLoad.min.js";

export {setBackgroundVisibility, toggleBackgroundVisibility, setSiteElementVisibility, toggleSiteElementVisibility};

const BACKGROUND_COLOR_BOX = document.getElementById("theme-custom-background");
const FOREGROUND_COLOR_BOX = document.getElementById("theme-custom-foreground");
const BACKGROUND_SELECTOR = document.getElementById("background-selector");

BACKGROUND_COLOR_BOX.addEventListener("input", setThemeColor);
FOREGROUND_COLOR_BOX.addEventListener("input", setThemeColor);
BACKGROUND_SELECTOR.addEventListener("change", setBackground);

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
 */
function setThemePreference() {
    const CUSTOM_COLORS = document.getElementById("theme-custom-colors");
    // const CUSTOM_COLORS_CHILD = CUSTOM_COLORS.children[0];

    const THEME_PREFERENCE_SELECTOR = document.getElementById("theme-preference");
    const SELECTED_CHILD = THEME_PREFERENCE_SELECTOR.children.item(THEME_PREFERENCE_SELECTOR.selectedIndex);
    localStorage.setItem("theme-preference", SELECTED_CHILD.value);

    setElementVisibilityWithScale(CUSTOM_COLORS, SELECTED_CHILD.value === "custom");

    const CSS_ROOT = document.documentElement;
    const ORIGINAL_ROOT = window.getComputedStyle(CSS_ROOT);

    switch (SELECTED_CHILD.value) {
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
            console.debug(`unknown option "${SELECTED_CHILD.value}"`);
            CSS_ROOT.style.setProperty("--bg-color", "");
            CSS_ROOT.style.setProperty("--fg-color", "");
    }
}

/**
 * Set's the background data to be displayed.
 */
function setBackground() {
    const FILE = BACKGROUND_SELECTOR.files[0];

    const FILE_READER = new FileReader();
    FILE_READER.addEventListener("load", () => {
        if (FILE.size >= 2621440) { // if file size is bigger than 1.5Mib (Mebibytes)
            alert("This file exceeds the storage quota. Please try a different image.");
            return;
        } else if (FILE.size > 1572864) { // if file size is bigger than 2.5Mib (Mebibytes)
            alert("This file is getting big.. Consider compressing the image or using a smaller sized picture.");
        }
        document.getElementById("toggle-background-button").removeAttribute("disabled");

        localStorage.setItem("background-data", FILE_READER.result);
        localStorage.setItem("background-enabled", true);

        const THEME_PREFERENCE_SELECTOR = document.getElementById("theme-preference");
        const BACKGROUND_IMAGE = document.getElementById("background-image");
        BACKGROUND_IMAGE.src = FILE_READER.result;
        setBackgroundVisibility(true);
        THEME_PREFERENCE_SELECTOR.value = "dark";
        setThemePreference();
    });
    FILE_READER.readAsDataURL(FILE);
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
 */
function setUniversalColorMode() {
    const CSS_ROOT = document.documentElement;

    const UNIVERSAL_COLOR_PICKER = document.getElementById("universal-color");
    const SELECTED_CHILD = UNIVERSAL_COLOR_PICKER.children.item(UNIVERSAL_COLOR_PICKER.selectedIndex);
    localStorage.setItem("universal-color-mode", SELECTED_CHILD.value);

    switch (SELECTED_CHILD.value) {
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
            console.debug(`unknown option "${SELECTED_CHILD.value}"`);
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

    setSiteElementVisibility("day-end-time-toggle", "day-end-time", true);
    setSiteElementVisibility("upcoming-events-toggle", "upcoming-events", true);
    setSiteElementVisibility("site-message-toggle", "site-message", true);
}

window.setThemePreference = setThemePreference;
window.toggleBackgroundVisibility = toggleBackgroundVisibility;
window.setBackgroundVisibility = setBackgroundVisibility;
window.clearBackground = clearBackground;
window.setUniversalColorMode = setUniversalColorMode;
window.toggleSiteElementVisibility = toggleSiteElementVisibility;
window.setSiteElementVisibility = setSiteElementVisibility;
window.resetSettings = resetSettings;
