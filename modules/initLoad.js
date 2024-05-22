/**
 * Sets up the website for use.
 */
export function initLoad() {
    // Setup the website.
    if (!localStorage.getItem("initialized"))
        firstLoad();

    document.documentElement.style.backgroundColor = localStorage.getItem("body-background-color");
    document.documentElement.style.color = localStorage.getItem("body-foreground-color");
}

/**
 * Sets up the website data for first time users.
 */
function firstLoad() {
    // Do first time setup if necessary.
    const systemDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');

    if (systemDarkTheme.matches) {
        localStorage.setItem("body-background-color", "#232323");
        localStorage.setItem("body-foreground-color", "#E3E3E3");

    } else {
        localStorage.setItem("body-background-color", "#E3E3E3");
        localStorage.setItem("body-foreground-color", "#232323");
    }

    localStorage.setItem("initialized", "1");
}
