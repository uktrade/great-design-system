import Revealer from "./revealer";

describe("Revealer", () => {
  let revealer;
  let mockDocument;

  beforeEach(() => {
    // Mock DOM elements
    mockDocument = {
      querySelectorAll: jest.fn(),
      addEventListener: jest.fn(),
      createElement: jest.fn(() => ({
        classList: { add: jest.fn() },
        style: { cssText: "" },
      })),
      body: { appendChild: jest.fn() },
      getElementById: jest.fn(),
    };

    // Mock buttons and modals
    const mockButtons = [
      {
        addEventListener: jest.fn(),
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
      },
      {
        addEventListener: jest.fn(),
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
      },
    ];
    const mockModals = [
      { setAttribute: jest.fn(), style: {} },
      { setAttribute: jest.fn(), style: {} },
    ];

    mockDocument.querySelectorAll
      .mockReturnValueOnce(mockButtons)
      .mockReturnValueOnce(mockModals);

    global.document = mockDocument;

    revealer = new Revealer();
  });

  test("constructor initializes properties correctly", () => {
    expect(revealer.buttons).toBeDefined();
    expect(revealer.modals).toBeDefined();
    expect(revealer.overlay).toBeDefined();
  });

  test("init adds event listeners to buttons", () => {
    expect(revealer.buttons[0].addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
    expect(revealer.buttons[1].addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
  });

  test("createOverlay creates and appends overlay element", () => {
    expect(mockDocument.createElement).toHaveBeenCalledWith("div");
    expect(mockDocument.body.appendChild).toHaveBeenCalled();
  });

  test("toggleReveal toggles visibility of target element", () => {
    const mockButton = {
      getAttribute: jest.fn().mockReturnValue("targetId"),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn().mockReturnValue(true),
    };
    const mockTarget = {
      getAttribute: jest.fn().mockReturnValue("true"),
      setAttribute: jest.fn(),
      style: {},
    };

    mockDocument.getElementById.mockReturnValue(mockTarget);

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
    expect(revealer.overlay.style.display).toBe("block");
  });

  test("handleOutsideClick hides all elements when clicking outside", () => {
    const mockEvent = {
      target: {
        closest: jest.fn().mockReturnValue(null),
      },
    };

    const hideAllSpy = jest.spyOn(revealer, "hideAll");

    revealer.handleOutsideClick(mockEvent);

    expect(hideAllSpy).toHaveBeenCalled();
  });

  test("handleEscapeKey hides all elements when pressing Escape", () => {
    const mockEvent = { key: "Escape" };

    const hideAllSpy = jest.spyOn(revealer, "hideAll");

    revealer.handleEscapeKey(mockEvent);

    expect(hideAllSpy).toHaveBeenCalled();
  });

  test("hideAll hides all visible elements", () => {
    const mockButton1 = {
      getAttribute: jest.fn().mockReturnValue("target1"),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn().mockReturnValue(false),
    };
    const mockButton2 = {
      getAttribute: jest.fn().mockReturnValue("target2"),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn().mockReturnValue(false),
    };

    const mockTarget1 = {
      getAttribute: jest.fn().mockReturnValue("false"),
      setAttribute: jest.fn(),
      style: {},
    };
    const mockTarget2 = {
      getAttribute: jest.fn().mockReturnValue("true"),
      setAttribute: jest.fn(),
      style: {},
    };

    revealer.buttons = [mockButton1, mockButton2];
    mockDocument.getElementById = jest
      .fn()
      .mockReturnValueOnce(mockTarget1)
      .mockReturnValueOnce(mockTarget2);

    // Mock the toggleReveal method
    revealer.toggleReveal = jest.fn();

    revealer.hideAll();

    expect(revealer.toggleReveal).toHaveBeenCalledWith(mockButton1);
    expect(revealer.toggleReveal).not.toHaveBeenCalledWith(mockButton2);
  });
});
