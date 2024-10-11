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
        contains: jest.fn(),
      })),
      body: { appendChild: jest.fn() },
      getElementById: jest.fn(),
    };

    // Mock buttons and targets
    const mockButtons = [
      {
        addEventListener: jest.fn(),
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
        hasAttribute: jest.fn(),
      },
      {
        addEventListener: jest.fn(),
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
        hasAttribute: jest.fn(),
      },
    ];
    const mockTargets = [
      { setAttribute: jest.fn(), style: {} },
      { setAttribute: jest.fn(), style: {} },
    ];

    mockDocument.querySelectorAll
      .mockReturnValueOnce(mockButtons)
      .mockReturnValueOnce(mockTargets);

    global.document = mockDocument;

    revealer = new Revealer();
  });

  test("constructor initializes properties correctly", () => {
    expect(revealer.buttons).toBeDefined();
    expect(revealer.targets).toBeDefined();
    expect(revealer.overlay).toBeDefined();
    expect(revealer.activeTarget).toBeNull();
  });

  test("init adds event listeners", () => {
    expect(mockDocument.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
    expect(mockDocument.addEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    expect(mockDocument.addEventListener).toHaveBeenCalledWith(
      "focusout",
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
    expect(revealer.activeTarget).toBe(mockTarget);
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

  test("handleFocusOut hides all elements when focus leaves active target", () => {
    const mockRelatedTarget = mockDocument.createElement();
    const mockEvent = {
      relatedTarget: mockRelatedTarget,
    };

    revealer.activeTarget = mockDocument.createElement();
    revealer.activeTarget.contains.mockReturnValue(false);
    revealer.hideAll = jest.fn(); // Mock hideAll method

    revealer.handleFocusOut(mockEvent);

    expect(revealer.hideAll).toHaveBeenCalled();
  });

  test("hideAll hides all visible elements", () => {
    const mockButton1 = {
      getAttribute: jest.fn().mockReturnValue("target1"),
      setAttribute: jest.fn(),
    };
    const mockButton2 = {
      getAttribute: jest.fn().mockReturnValue("target2"),
      setAttribute: jest.fn(),
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
    revealer.overlay = { style: {} };
    mockDocument.getElementById = jest
      .fn()
      .mockReturnValueOnce(mockTarget1)
      .mockReturnValueOnce(mockTarget2);

    revealer.toggleReveal = jest.fn();

    revealer.hideAll();

    expect(revealer.toggleReveal).toHaveBeenCalled();
    expect(revealer.toggleReveal).toHaveBeenCalledTimes(1);
    expect(revealer.overlay.style.display).toBe("none");
    expect(revealer.activeTarget).toBeNull();
  });
});
