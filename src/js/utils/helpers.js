import { modal } from "../ui/modal.js";

/**
 * Debounce utility with cancel method.
 * @param {Function} fn - Function to debounce.
 * @param {number} delay - Delay in ms.
 * @returns {Function} Debounced function with .cancel()
 *
 * using a function declaration makes it hoisted and available anywhere in
 * the file, while a const is only available after its definition.
 */
export function debounce(fn, delay) {
  let timer;
  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  }
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/**
 * Creates a DOM element of the specified type with the given text value.
 * @param {string} elemType - The type of the element to create (e.g., 'button', 'div').
 * @param {string|number} val - The text value to set as the inner text of the element.
 * @returns {HTMLElement|null} The created DOM element, or null if failed.
 */
export function createElem(elemType, val) {
  if (typeof elemType !== "string" || !elemType) {
    console.error("Invalid element type for createElem:", elemType);
    modal.showError(
      "Element Creation Error",
      "Invalid element type for createElem received.",
      `\`elemType\` must be of type string, but received ${typeof elemType}.`
    );
    return null;
  }

  if (typeof val !== "string" && typeof val !== "number") {
    console.error("Invalid value for createElem:", val);
      modal.showError(
        "Invalid Value",
        "Invalid value for createElem received.",
        `\`val\` must be of type string or number, but received ${typeof val}.`
      );
    return null;
  }

  const elem = document.createElement(elemType);
  elem.innerText = val;
  return elem;
}
