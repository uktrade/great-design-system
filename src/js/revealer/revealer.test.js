import Revealer from "./revealer";
import { Overlay } from "../utils/overlay";

jest.mock("../utils/overlay");

describe("Revealer", () => {
  let revealer;
  let mockDocument;
  let mockButton;
  let mockTarget;
  let mockOverlay;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock overlay
    mockOverlay = {
      show: jest.fn(),
      hide: jest.fn(),
      destroy: jest.fn(),
    };
    Overlay.mockImplementation(() => mockOverlay);

    mockButton = {
      getAttribute: jest.fn((attr) => {
        if (attr === "aria-controls") return "target-1";
        if (attr === "aria-expanded") return "false";
        return null;
      }),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      contains: jest.fn().mockReturnValue(false),
      addEventListener: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      style: {},
    };

    mockTarget = {
      getAttribute: jest.fn().mockReturnValue("false"),
      setAttribute: jest.fn(),
      contains: jest.fn().mockReturnValue(false),
      style: {},
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
      },
    };

    mockDocument = {
      querySelectorAll: jest.fn().mockReturnValue([mockButton]),
      addEventListener: jest.fn(),
      createElement: jest.fn(() => ({
        classList: { add: jest.fn() },
        style: { cssText: "" },
      })),
      removeEventListener: jest.fn(),
      body: {
        appendChild: jest.fn(),
        style: {},
      },
      getElementById: jest.fn().mockReturnValue(mockTarget),
    };

    global.document = mockDocument;
    revealer = new Revealer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("initialization", () => {
    test("initializes with correct event listeners", () => {
      expect(mockButton.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        "focusout",
        expect.any(Function),
      );
    });

    test("creates overlay instance", () => {
      expect(Overlay).toHaveBeenCalled();
    });
  });

  describe("toggleReveal", () => {
    test("shows element when hidden", () => {
      mockTarget.getAttribute.mockReturnValue("true"); // aria-hidden

      revealer.toggleReveal(mockButton);

      expect(mockTarget.setAttribute).toHaveBeenCalledWith(
        "aria-hidden",
        "false",
      );
      expect(mockTarget.style.display).toBe("block");
      expect(mockButton.setAttribute).toHaveBeenCalledWith(
        "aria-expanded",
        "true",
      );
      expect(mockTarget.classList.add).toHaveBeenCalledWith("is-active");
      expect(mockButton.classList.add).toHaveBeenCalledWith("is-active");
    });

    test("hides element when visible", () => {
      mockTarget.getAttribute.mockReturnValue("false"); // aria-hidden

      revealer.toggleReveal(mockButton);

      expect(mockTarget.setAttribute).toHaveBeenCalledWith(
        "aria-hidden",
        "true",
      );
      expect(mockTarget.style.display).toBe("none");
      expect(mockButton.setAttribute).toHaveBeenCalledWith(
        "aria-expanded",
        "false",
      );
      expect(mockTarget.classList.remove).toHaveBeenCalledWith("is-active");
      expect(mockButton.classList.remove).toHaveBeenCalledWith("is-active");
    });

    test("handles modal behavior when data-attribute present", () => {
      mockButton.hasAttribute.mockReturnValue(true);
      mockTarget.getAttribute.mockReturnValue("true");

      revealer.toggleReveal(mockButton);

      expect(mockOverlay.show).toHaveBeenCalled();
    });
  });

  describe("event handling", () => {
    test("handleOutsideClick ignores clicks inside target", () => {
      const mockEvent = {
        target: {
          closest: jest.fn().mockReturnValue(false),
        },
      };
      mockTarget.contains.mockReturnValue(true);
      mockButton.getAttribute.mockReturnValue("true");

      revealer.handleOutsideClick(mockEvent);

      expect(mockTarget.setAttribute).not.toHaveBeenCalled();
    });

    test("handleEscapeKey ignores non-escape keys", () => {
      const event = { key: "Enter" };
      revealer.handleEscapeKey(event);
      expect(mockOverlay.hide).not.toHaveBeenCalled();
    });

    test("handleFocusOut hides elements when focus leaves target", () => {
      const event = { relatedTarget: mockDocument.createElement() };
      revealer.activeTarget = mockTarget;

      revealer.handleFocusOut(event);

      expect(mockTarget.setAttribute).toHaveBeenCalledWith(
        "aria-hidden",
        "true",
      );
    });
  });
});
