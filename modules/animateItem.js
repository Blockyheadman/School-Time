/*
 * Copyright (c) 2024. Elijah McCalley
 * All rights reserved.
 */

export {toggleElementVisibility, setElementVisibility};

/**
 * Toggles the visibility of an element with an animation.
 * @param element {HTMLElement} - The HTML element you wish to toggle visibility on
 */
function toggleElementVisibility(element) {
    const notVisible = element.style.getPropertyValue("display") === "none"
    setElementVisibility(element, notVisible);
}

/**
 * Sets the visibility of an element with a transition.
 * @param element {HTMLElement} - The HTML element you wish to set visibility on
 * @param makeVisible {boolean} - If to make the visible or not
 * @param transitionSpeedMs {number} - The speed of the transition in milliseconds
 */
function setElementVisibility(element, makeVisible, transitionSpeedMs = 250) {
    if (element.style.transition !== "") {
        return;
    }

    if (makeVisible === true) {
        element.style.transition = "250ms";
        element.style.display = "";
        setTimeout(() => {
            element.style.opacity = "1";
            setTimeout(() => {
                element.style.opacity = "";
                element.style.transition = "";
            }, transitionSpeedMs);
        }, transitionSpeedMs);
    } else if (makeVisible === false) {
        element.style.transition = "250ms";
        element.style.opacity = "0";
        setTimeout(() => {
            element.style.display = "none";
            element.style.transition = "";
        }, transitionSpeedMs);
    } else {
        throw SyntaxError("Missing 'makeVisible' property");
    }
}

window.toggleElementVisibility = toggleElementVisibility;
window.setElementVisibility = setElementVisibility;