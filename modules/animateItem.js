/*
 * Copyright (c) 2024. Elijah McCalley
 * All rights reserved.
 */

export {toggleElementVisibility, setElementVisibility, toggleElementVisibilityWithScale, setElementVisibilityWithScale};

/**
 * Toggles the visibility of an element with a fade-in transition.
 * @param element {HTMLElement} - The HTML element you wish to toggle visibility on.
 * @param transitionSpeedMs {number} - The speed of the transition in milliseconds.
 */
function toggleElementVisibility(element, transitionSpeedMs = 250) {
    const NOT_VISIBLE = element.style.getPropertyValue("display") === "none"
    setElementVisibility(element, NOT_VISIBLE, transitionSpeedMs);
}

/**
 * Sets the visibility of an element with a fade-in transition.
 * @param element {HTMLElement} - The HTML element you wish to set visibility on.
 * @param makeVisible {boolean} - If to make the visible or not.
 * @param transitionSpeedMs {number} - The speed of the transition in milliseconds.
 */
function setElementVisibility(element, makeVisible, transitionSpeedMs = 250) {
    const NO_ANIMATION = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (NO_ANIMATION.matches) {
        if (makeVisible === true) {
            element.style.opacity = "1";
            element.style.display = "";
        } else {
            element.style.opacity = "0";
            element.style.display = "none";
        }
        return;
    }

    if (element.style.transition !== "") {
        return;
    }

    if (makeVisible === true) {
        element.style.transition = transitionSpeedMs + "ms";
        element.style.display = "";
        setTimeout(() => {
            element.style.opacity = "1";
            setTimeout(() => {
                element.style.opacity = "";
                element.style.transition = "";
            }, transitionSpeedMs);
        }, transitionSpeedMs);
    } else if (makeVisible === false) {
        element.style.transition = transitionSpeedMs + "ms";
        element.style.opacity = "0";
        setTimeout(() => {
            element.style.display = "none";
            element.style.transition = "";
        }, transitionSpeedMs);
    } else {
        throw SyntaxError("Missing 'makeVisible' property");
    }
}

/**
 * Toggles the visibility of an element with a scaling transition.
 *
 * NOTE: This requires the parent and child elements to both be divs to work.
 *
 * @param parentElement {HTMLElement} - The parent HTML element you wish to toggle visibility on.
 * @param transitionSpeedMs {number} - The speed of the transition in milliseconds.
 */
function toggleElementVisibilityWithScale(parentElement, transitionSpeedMs = 500) {
    const NOT_VISIBLE = parentElement.style.getPropertyValue("grid-template-rows") === "0fr"
    setElementVisibilityWithScale(parentElement, NOT_VISIBLE, transitionSpeedMs);
}

/**
 * Sets the visibility of an element with a scaling transition.
 *
 * NOTE: This requires the parent and child elements to both be divs to work.
 *
 * @param parentElement {HTMLElement} - The parent HTML element you wish to set visibility on.
 * @param makeVisible {boolean} - If to make the visible or not.
 * @param transitionSpeedMs {number} - The speed of the transition in milliseconds.
 */
function setElementVisibilityWithScale(parentElement, makeVisible, transitionSpeedMs = 500) {
    if (parentElement.children.length === 0 || parentElement.children[0].tagName.toLowerCase() !== "div") {
        makeVisible = parentElement.style.getPropertyValue("display") === "none";
        setElementVisibility(parentElement, makeVisible, transitionSpeedMs)
        throw new Error("Must have a child div for this transition to work. Using default transition.");
    }
    const CHILD_ELEMENT = parentElement.children[0];

    parentElement.style.display = "grid";
    parentElement.style.transition = "grid-template-rows " + transitionSpeedMs + "ms";
    CHILD_ELEMENT.style.overflow = "hidden"; // Setting this value in case it isn't by default
    CHILD_ELEMENT.style.transition = "opacity " + transitionSpeedMs + "ms, transform " + transitionSpeedMs + "ms";

    if (makeVisible) {
        parentElement.style.gridTemplateRows = "1fr";
        CHILD_ELEMENT.style.opacity = "1";
        CHILD_ELEMENT.style.transform = "";
        // CHILD_ELEMENT.style.visibility = "visible";

        parentElement.removeAttribute("aria-hidden");
        parentElement.removeAttribute("tabIndex");
        Array.from(parentElement.querySelectorAll("*")).forEach(childElement => {
            childElement.removeAttribute("aria-hidden");
            childElement.removeAttribute("tabIndex");
        })
    } else {
        parentElement.style.gridTemplateRows = "0fr";
        CHILD_ELEMENT.style.opacity = "0";
        CHILD_ELEMENT.style.transform = "scale(0.5)";

        parentElement.setAttribute("aria-hidden", "true");
        parentElement.tabIndex = -1;
        Array.from(parentElement.querySelectorAll("*")).forEach(childElement => {
            childElement.setAttribute("aria-hidden", "true");
            childElement.tabIndex = -1;
        })

        // setTimeout(() => {
        // CHILD_ELEMENT.style.visibility = "hidden";
        // }, transitionSpeedMs);
    }

}

window.toggleElementVisibility = toggleElementVisibility;
window.setElementVisibility = setElementVisibility;
window.toggleElementVisibilityWithScale = toggleElementVisibilityWithScale;
window.setElementVisibilityWithScale = setElementVisibilityWithScale;