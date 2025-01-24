import { CookieManager } from "./cookie-manager";
import { Overlay } from "../../js/utils/overlay";

export class CookieNotice {
  constructor(options = {}) {
    this.cookieManager = new CookieManager(options.cookieDomain);

    this.modal = document.getElementById("cookie-modal");
    this.banner = document.getElementById("cookie-banner");
    this.modalTitle = document.getElementById("cookie-modal-title");
    this.bannerTitle = document.getElementById("cookie-banner-title");
    this.statusElement = document.getElementById("cookie-preference-status");

    // Store focused element to return to later
    this.previouslyFocusedElement = null;

    // Trap focus in modal
    this.focusableElements =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    this.overlay = new Overlay({ zIndex: 1000 });

    this.init();
    this.handleEscapeKey = this.handleEscapeKey.bind(this);
    this.handleTabKey = this.handleTabKey.bind(this);
  }

  init() {
    if (
      !this.cookieManager.getPreferences() &&
      !window.location.pathname.includes("/cookie-preferences")
    ) {
      this.showModal();
      this.bindEvents();
    }
  }

  bindEvents() {
    // Modal buttons
    this.modal
      .querySelector('[data-action="accept-cookies"]')
      .addEventListener("click", () => this.acceptAllCookies());

    this.modal
      .querySelector('[data-action="reject-cookies"]')
      .addEventListener("click", () => this.rejectAllCookies());

    // Banner close button
    this.banner
      .querySelector('[data-action="hide-banner"]')
      .addEventListener("click", () => this.hideBanner());

    // Keyboard event listeners
    document.addEventListener("keydown", this.handleEscapeKey);
    this.modal.addEventListener("keydown", this.handleTabKey);
  }

  handleEscapeKey(event) {
    if (event.key === "Escape" && !this.modal.hidden) {
      this.rejectAllCookies();
    }
  }

  handleTabKey(event) {
    if (event.key === "Tab") {
      const focusableContent = this.modal.querySelectorAll(
        this.focusableElements,
      );
      const firstFocusableElement = focusableContent[0];
      const lastFocusableElement =
        focusableContent[focusableContent.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement.focus();
        }
      }
    }
  }

  showModal() {
    this.previouslyFocusedElement = document.activeElement;
    this.modal.hidden = false;
    this.modalTitle.focus();
    this.overlay.show();
  }

  hideModal() {
    this.modal.hidden = true;
    this.overlay.hide();
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
    document.removeEventListener("keydown", this.handleEscapeKey);
  }

  showBanner() {
    this.banner.hidden = false;
    this.bannerTitle.focus();
  }

  hideBanner() {
    this.banner.hidden = true;
    // Return focus to the page heading if it exists
    const mainHeading = document.querySelector("h1");
    if (mainHeading) {
      mainHeading.focus();
    }
  }

  acceptAllCookies() {
    this.cookieManager.setPolicy(true, true, true);
    this.cookieManager.setPreferences();
    this.hideModal();
    this.statusElement.textContent = this.statusElement.dataset.acceptedText;
    this.showBanner();

    this.triggerAnalytics("cookies_policy_accept");
    this.triggerAnalytics("gtm.dom");
  }

  rejectAllCookies() {
    this.cookieManager.setPolicy(false, false, false);
    this.cookieManager.setPreferences();
    this.hideModal();
    this.statusElement.textContent = this.statusElement.dataset.rejectedText;
    this.showBanner();
  }

  triggerAnalytics(eventName) {
    if (window.analytics) {
      window.analytics({ event: eventName });
    }
  }

  destroy() {
    document.removeEventListener("keydown", this.handleEscapeKey);
    this.modal.removeEventListener("keydown", this.handleTabKey);
    this.overlay.destroy();
  }
}
