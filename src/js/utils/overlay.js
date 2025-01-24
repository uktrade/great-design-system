export class Overlay {
  constructor(options = {}) {
    this.zIndex = options.zIndex || 2;
    this.backgroundColor = options.backgroundColor || "rgba(0, 0, 0, 0.5)";
    this.element = this.create();
  }

  create() {
    const overlay = document.createElement("div");
    overlay.classList.add("great-ds-overlay");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: ${this.backgroundColor};
      display: none;
      z-index: ${this.zIndex};
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  show() {
    this.element.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  hide() {
    this.element.style.display = "none";
    document.body.style.overflow = "";
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
