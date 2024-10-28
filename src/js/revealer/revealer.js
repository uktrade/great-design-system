export default class Revealer {
  constructor() {
    this.buttons = document.querySelectorAll("[data-great-ds-reveal-button]");
    this.targets = document.querySelectorAll("[data-great-ds-reveal-target]");
    this.overlay = this.createOverlay();
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

  createOverlay() {
    const overlay = document.createElement("div");
    overlay.classList.add("great-ds-revealer-overlay");
    overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
            z-index: 998;
        `;
    document.body.appendChild(overlay);
    return overlay;
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
        this.overlay.style.display = isHidden ? "block" : "none";
        this.activeTarget = isHidden ? target : null;
      }
    }
  }

  handleOutsideClick(event) {
    if (
      !event.target.closest("[data-great-ds-reveal-button]") &&
      !event.target.closest('[aria-hidden="false"]')
    ) {
      this.hideAll();
    }
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
    this.overlay.style.display = "none";
    this.activeTarget = null;
  }
}
