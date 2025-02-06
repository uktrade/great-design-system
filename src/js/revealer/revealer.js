import { Overlay } from "../utils/overlay";

export default class Revealer {
  constructor() {
    this.buttons = document.querySelectorAll("[data-great-ds-reveal-button]");
    this.overlay = new Overlay();
    this.activeTarget = null;
    this.init();
  }

  init() {
    this.buttons.forEach((button) => {
      button.addEventListener("click", () => this.toggleReveal(button));
    });

    document.addEventListener("click", (e) => this.handleOutsideClick(e));
    document.addEventListener("keydown", (e) => this.handleEscapeKey(e));
    document.addEventListener("focusout", (e) => this.handleFocusOut(e));
  }

  toggleReveal(button) {
    const targetId = button.getAttribute("aria-controls");
    const target = document.getElementById(targetId);

    if (target) {
      const isHidden = target.getAttribute("aria-hidden") !== "false";
      target.setAttribute("aria-hidden", isHidden ? "false" : "true");
      target.style.display = isHidden ? "block" : "none";
      button.setAttribute("aria-expanded", isHidden ? "true" : "false");
      if (isHidden) {
        target.classList.add("is-active");
        button.classList.add("is-active");
      } else {
        target.classList.remove("is-active");
        button.classList.remove("is-active");
      }

      if (button.hasAttribute("data-great-ds-reveal-modal")) {
        if (isHidden) {
          this.overlay.show();
        } else {
          this.overlay.hide();
        }
        this.activeTarget = isHidden ? target : null;
      }
    }
  }

  handleOutsideClick(event) {
    const activeButtons = document.querySelectorAll(
      '[data-great-ds-reveal-button][aria-expanded="true"]',
    );
    activeButtons.forEach((button) => {
      const buttonController = button.getAttribute("aria-controls");
      const targetElement = document.getElementById(buttonController);

      if (
        !targetElement.contains(event.target) &&
        !button.contains(event.target)
      ) {
        this.toggleReveal(button);
      }
    });
  }

  handleEscapeKey(event) {
    if (event.key === "Escape") {
      this.hideAll();
    }
  }

  handleFocusOut(event) {
    if (this.activeTarget && !this.activeTarget.contains(event.relatedTarget)) {
      this.hideAll();
    }
  }

  hideAll() {
    this.buttons.forEach((button) => {
      const targetId = button.getAttribute("aria-controls");
      const target = document.getElementById(targetId);
      if (target && target.getAttribute("aria-hidden") === "false") {
        this.toggleReveal(button);
      }
    });
    this.overlay.hide();
    this.activeTarget = null;
  }
}
