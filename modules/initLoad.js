/*
 * Copyright (c) 2024. Elijah McCalley
 * All rights reserved.
 */

export {initLoad};

/**
 * Sets up the website for use.
 */
function initLoad() {
    // Set up the website.
    if (location.pathname === "/" && !localStorage.getItem("initialized"))
        firstLoad();

    let root = document.querySelector(":root")
    root.style.setProperty("--bg-color", localStorage.getItem("body-background-color"));
    root.style.setProperty("--fg-color", localStorage.getItem("body-foreground-color"));
}

/**
 * Sets up the website data for first time users.
 */
function firstLoad() {
    // Do first time setup if necessary.
    const SYSTEM_DARK_THEME = window.matchMedia('(prefers-color-scheme: dark)');

    if (SYSTEM_DARK_THEME.matches) {
        localStorage.setItem("body-background-color", "#232323");
        localStorage.setItem("body-foreground-color", "#F1F1F1");

    } else {
        localStorage.setItem("body-background-color", "#F1F1F1");
        localStorage.setItem("body-foreground-color", "#000000");
    }

    localStorage.setItem("initialized", "1");
}
