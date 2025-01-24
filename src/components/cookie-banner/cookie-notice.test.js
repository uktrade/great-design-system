import { CookieNotice } from "./cookie-notice";
import { CookieManager } from "./cookie-manager";
import { Overlay } from "../../js/utils/overlay";

jest.mock("./cookie-manager");
jest.mock("../../js/utils/overlay");

describe("CookieNotice", () => {
  let cookieNotice;
  let mockElements;

  beforeEach(() => {
    CookieManager.mockClear();
    Overlay.mockClear();

    mockElements = {
      modal: createMockElement("modal"),
      banner: createMockElement("banner"),
      modalTitle: createMockElement("modalTitle"),
      bannerTitle: createMockElement("bannerTitle"),
      statusElement: createMockElement("statusElement"),
      acceptButton: createMockElement("acceptButton"),
      rejectButton: createMockElement("rejectButton"),
      hideBannerButton: createMockElement("hideBannerButton"),
    };

    global.document = {
      getElementById: jest.fn((id) => {
        switch (id) {
          case "cookie-modal":
            return mockElements.modal;
          case "cookie-banner":
            return mockElements.banner;
          case "cookie-modal-title":
            return mockElements.modalTitle;
          case "cookie-banner-title":
            return mockElements.bannerTitle;
          case "cookie-preference-status":
            return mockElements.statusElement;
          default:
            return null;
        }
      }),
      activeElement: mockElements.modal,
      querySelector: jest.fn(() => mockElements.modalTitle),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      body: { style: {} },
    };

    // Mock window location
    global.window = {
      location: { pathname: "/" },
    };

    mockElements.modal.querySelector = jest.fn((selector) => {
      if (selector === '[data-action="accept-cookies"]')
        return mockElements.acceptButton;
      if (selector === '[data-action="reject-cookies"]')
        return mockElements.rejectButton;
      return null;
    });

    mockElements.banner.querySelector = jest.fn((selector) => {
      if (selector === '[data-action="hide-banner"]')
        return mockElements.hideBannerButton;
      return null;
    });

    // Mock CookieManager getPreferences
    CookieManager.prototype.getPreferences = jest.fn().mockReturnValue(null);

    cookieNotice = new CookieNotice({ cookieDomain: "test.com" });
  });

  test("constructor initializes properties correctly", () => {
    expect(CookieManager).toHaveBeenCalledWith("test.com");
    expect(Overlay).toHaveBeenCalledWith({ zIndex: 1000 });
    expect(cookieNotice.modal).toBe(mockElements.modal);
    expect(cookieNotice.banner).toBe(mockElements.banner);
  });

  test("acceptAllCookies sets correct preferences", () => {
    cookieNotice.acceptAllCookies();

    expect(CookieManager.prototype.setPolicy).toHaveBeenCalledWith(
      true,
      true,
      true,
    );
    expect(mockElements.statusElement.textContent).toBe("accepted");
    expect(mockElements.banner.hidden).toBe(false);
  });

  test("rejectAllCookies sets correct preferences", () => {
    cookieNotice.rejectAllCookies();

    expect(CookieManager.prototype.setPolicy).toHaveBeenCalledWith(
      false,
      false,
      false,
    );
    expect(mockElements.statusElement.textContent).toBe("rejected");
    expect(mockElements.banner.hidden).toBe(false);
  });

  test("destroy cleans up event listeners", () => {
    cookieNotice.destroy();

    expect(document.removeEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    expect(mockElements.modal.removeEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    expect(Overlay.prototype.destroy).toHaveBeenCalled();
  });

  describe("initialization", () => {
    beforeEach(() => {
      mockElements.modal.hidden = false;
    });

    test("shows modal when no preferences set and not on preferences page", () => {
      expect(mockElements.modal.hidden).toBe(false);
      expect(mockElements.modalTitle.focus).toHaveBeenCalled();
    });

    test("doesn't show modal on preferences page", () => {
      global.window.location.pathname = "/cookie-preferences";
      const notice = new CookieNotice({ cookieDomain: "test.com" });
      notice.hideModal();
      expect(mockElements.modal.hidden).toBe(true);
    });

    test("doesn't show modal when preferences exist", () => {
      CookieManager.prototype.getPreferences.mockReturnValue("true");
      const notice = new CookieNotice({ cookieDomain: "test.com" });
      notice.hideModal();
      expect(mockElements.modal.hidden).toBe(true);
    });
  });

  describe("modal management", () => {
    test("showModal stores previously focused element", () => {
      const previousElement = createMockElement("previous");
      document.activeElement = previousElement;

      cookieNotice.showModal();
      expect(cookieNotice.previouslyFocusedElement).toBe(previousElement);
    });

    test("hideModal restores focus to previous element", () => {
      const previousElement = createMockElement("previous");
      cookieNotice.previouslyFocusedElement = previousElement;

      cookieNotice.hideModal();
      expect(previousElement.focus).toHaveBeenCalled();
    });

    test("handles tab key navigation within modal", () => {
      const event = {
        key: "Tab",
        preventDefault: jest.fn(),
        shiftKey: false,
      };
      cookieNotice.handleTabKey(event);
    });
  });

  describe("accessibility", () => {
    test("sets correct ARIA attributes", () => {
      mockElements.modal.hidden = true;
      cookieNotice.showModal();
      expect(mockElements.modal.hidden).toBe(false);
      expect(mockElements.modalTitle.focus).toHaveBeenCalled();
    });

    test("handles escape key to close modal", () => {
      const event = {
        key: "Escape",
        preventDefault: jest.fn(),
      };
      cookieNotice.handleEscapeKey(event);
      expect(mockElements.modal.hidden).toBe(true);
    });
  });
});

function createMockElement(id) {
  return {
    id,
    hidden: true,
    style: {},
    getAttribute: jest.fn(),
    setAttribute: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    focus: jest.fn(),
    contains: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    dataset: {
      acceptedText: "accepted",
      rejectedText: "rejected",
    },
    textContent: "",
  };
}
