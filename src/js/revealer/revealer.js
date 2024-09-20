export default class Revealer {
  constructor() {
    this.buttons = document.querySelectorAll("[data-reveal-button]");
    this.modals = document.querySelectorAll("[data-reveal-modal]");
    this.overlay = this.createOverlay();
    this.init();
  }

  init() {
    this.buttons.forEach((button) => {
      button.addEventListener("click", () => this.toggleReveal(button));
    });

    document.addEventListener("click", (e) => this.handleOutsideClick(e));
    document.addEventListener("keydown", (e) => this.handleEscapeKey(e));
  }

  createOverlay() {
    const overlay = document.createElement("div");
    overlay.classList.add("revealer-overlay");
    overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.3);
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

      if (button.hasAttribute("data-reveal-modal")) {
        this.overlay.style.display = isHidden ? "block" : "none";
      }
    }
  }

  handleOutsideClick(event) {
    if (
      !event.target.closest("[data-reveal-button]") &&
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

  hideAll() {
    this.buttons.forEach((button) => {
      const targetId = button.getAttribute("aria-controls");
      const target = document.getElementById(targetId);
      if (target && target.getAttribute("aria-hidden") === "false") {
        this.toggleReveal(button);
      }
    });
  }
}
