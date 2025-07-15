import { gsap } from "gsap";

/**
 * Helper to animate modal open/close transitions.
 * @param {HTMLElement} modalElem
 * @param {HTMLElement} contentElem
 * @param {boolean} open
 * @param {Function} [onComplete]
 */
function animateModal(modalElem, contentElem, open, onComplete) {
  const tl = gsap.timeline({ onComplete });
  if (open) {
    tl.to(modalElem, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
    }).fromTo(
      contentElem,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
      "-=0.1"
    );
  } else {
    tl.to(contentElem, {
      scale: 0.8,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
    }).to(
      modalElem,
      {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      },
      "-=0.1"
    );
  }
}

// TEST CASE: Error Modal Testing
// The modal is now globally accessible as window.modal for testing
//
// Test in browser console:
// 1. modal.showError('Test Error', 'This is a test error message for development.', 'Error details: Testing error modal display')
// 2. app.state.selectedChord = 'invalid-chord-name'; app.displayChordInfo()  // Triggers real error
// 3. Uncomment line below to test automatically on page load:
// modal.showError('Auto Test', 'This error shows automatically on page load for testing.', 'Remove this line in production')

// Modal functionality
export const modal = {
  // Cache modal elements for performance - eliminates repeated DOM queries
  elements: {
    acknowledgements: {
      modal: null,
      openBtn: null,
      closeBtn: null,
      content: null,
    },
    information: {
      modal: null,
      openBtn: null,
      closeBtn: null,
      content: null,
    },
    error: {
      modal: null,
      message: null,
      closeBtn: null,
      okBtn: null,
      content: null,
    },
  },

  /**
   * Initializes the modal functionality.
   * This function caches modal elements, sets up event listeners,
   * and handles global escape key events for closing modals.
   * It ensures that modals are ready for interaction and provides a smooth user experience.
   */
  init() {
    // Cache all modal elements once during initialization
    this.elements.acknowledgements.modal = document.getElementById(
      "acknowledgements-modal"
    );
    this.elements.acknowledgements.openBtn = document.getElementById(
      "acknowledgements-btn"
    );
    this.elements.acknowledgements.closeBtn =
      document.getElementById("close-modal");
    this.elements.acknowledgements.content =
      this.elements.acknowledgements.modal?.querySelector(".bg-white");

    this.elements.information.modal =
      document.getElementById("information-modal");
    this.elements.information.openBtn =
      document.getElementById("information-btn");
    this.elements.information.closeBtn =
      document.getElementById("close-info-modal");
    this.elements.information.content =
      this.elements.information.modal?.querySelector(".bg-white");

    this.elements.error.modal = document.getElementById("error-modal");
    this.elements.error.message = document.getElementById("error-message");
    this.elements.error.closeBtn = document.getElementById("close-error-modal");
    this.elements.error.okBtn = document.getElementById("error-ok-btn");
    this.elements.error.content =
      this.elements.error.modal?.querySelector(".bg-red-600");

    // Setup event listeners using cached elements
    this.setupModalEvents();

    // Global escape key handler for all modals using cached elements
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (
          this.elements.acknowledgements.modal &&
          this.elements.acknowledgements.modal.classList.contains(
            "pointer-events-auto"
          )
        ) {
          this.closeModal("acknowledgements");
        }
        if (
          this.elements.information.modal &&
          this.elements.information.modal.classList.contains(
            "pointer-events-auto"
          )
        ) {
          this.closeModal("information");
        }
        if (
          this.elements.error.modal &&
          this.elements.error.modal.classList.contains("pointer-events-auto")
        ) {
          this.closeModal("error");
        }
      }
    });
  },

  /**
   * Sets up event listeners for modal open/close buttons and click events.
   * Handles opening/closing modals, click outside to close, and accessibility features.
   * Supports multiple modal types and multiple close buttons.
   * @returns {void}
   */
  setupModalEvents() {
    // List all modal types you want to support
    const modalTypes = ["acknowledgements", "information", "error"];

    modalTypes.forEach((type) => {
      const modalEl = this.elements[type];
      if (!modalEl) return;

      // Open button
      if (modalEl.openBtn) {
        modalEl.openBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.openModal(type);
        });
      }

      // Close button(s)
      if (modalEl.closeBtn) {
        modalEl.closeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.closeModal(type);
        });
      }
      // Optional: support multiple close buttons (array)
      if (Array.isArray(modalEl.closeBtns)) {
        modalEl.closeBtns.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            this.closeModal(type);
          });
        });
      }

      // Ok button (for error modal)
      if (modalEl.okBtn) {
        modalEl.okBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.closeModal(type);
        });
      }

      // Click outside modal content closes modal
      if (modalEl.modal) {
        modalEl.modal.addEventListener("click", (e) => {
          if (e.target === modalEl.modal) {
            this.closeModal(type);
          }
        });
      }
    });
  },

  /**
   * Opens a modal of the specified type.
   * @param {string} modalType - The type of modal to open (e.g., 'acknowledgements', 'information', 'error').
   * @returns {void}
   */
  openModal(modalType) {
    const modalEl = this.elements[modalType];

    // Error handling: Check if modalEl elements exist
    if (!modalEl || !modalEl.modal || !modalEl.content) {
      console.warn(`Modal elements not found for ${modalType}`);
      return;
    }

    // Accessibility: Set ARIA attributes and focus
    modalEl.modal.setAttribute("role", "dialog");
    modalEl.modal.setAttribute("aria-modal", "true");
    modalEl.modal.setAttribute("tabindex", "-1");
    modalEl.modal.focus();

    // Enable interaction and start animation (use a twailwindcss class)
    modalEl.modal.classList.add("pointer-events-auto");
    modalEl.modal.classList.remove("pointer-events-none");
    animateModal(modalEl.modal, modalEl.content, true);
  },

  /**
   * Closes a modal of the specified type.
   * @param {string} modalType - The type of modal to close (e.g., 'acknowledgements', 'information', 'error').
   * @returns {void}
   */
  closeModal(modalType) {
    const modalEl = this.elements[modalType];

    // Error handling: Check if modalEl elements exist
    if (!modalEl || !modalEl.modal || !modalEl.content) {
      console.warn(`Modal elements not found for ${modalType}`);
      return;
    }

    animateModal(modalEl.modal, modalEl.content, false, () => {
      modalEl.modal.classList.add("pointer-events-none");
      modalEl.modal.classList.remove("pointer-events-auto");
    });
  },

  /**
   * Show error modal with user-friendly error message
   * @param {string} title - Error title
   * @param {string} message - User-friendly error message
   * @param {string} details - Technical details (optional)
   * @returns {void}
   */
  showError(title, message, details = null) {
    if (!this.elements.error.modal || !this.elements.error.message) {
      console.warn("Error modal elements not found");
      return;
    }

    // Set error message content
    this.elements.error.message.innerHTML = `
        <h3 class="font-semibold mb-2">${title}</h3>
        <p class="mb-2">${message}</p>
        ${
          details && details.trim()
            ? `<details class="text-sm text-red-200 mt-2">
            <summary class="cursor-pointer hover:text-white">Technical Details</summary>
            <pre class="mt-1 text-xs bg-red-700 p-2 rounded">${details}</pre>
        </details>`
            : ""
        }
    `;

    // Show modal with GSAP animation (reuse existing openModal logic)
    this.elements.error.modal.classList.add("pointer-events-auto");
    this.elements.error.modal.classList.remove("pointer-events-none");
    animateModal(this.elements.error.modal, this.elements.error.content, true);
  },
};
