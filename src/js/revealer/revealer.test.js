import Revealer from "./revealer";

describe("Revealer", () => {
  let revealer;
  let mockDocument;

  beforeEach(() => {
    mockDocument = {
      querySelectorAll: jest.fn().mockReturnValue([]),
      addEventListener: jest.fn(),
      createElement: jest.fn(() => ({
        classList: { add: jest.fn() },
        style: { cssText: "" },
      })),
      body: { appendChild: jest.fn() },
      getElementById: jest.fn(),
    };

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
    const events = ["click", "keydown", "focusout"];
    events.forEach((event) => {
      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        event,
        expect.any(Function),
      );
    });
  });

  test("createOverlay creates and appends overlay element", () => {
    expect(mockDocument.createElement).toHaveBeenCalledWith("div");
    expect(mockDocument.body.appendChild).toHaveBeenCalled();
  });

  test("toggleReveal toggles visibility and classes", () => {
    const mockButton = createMockElement();
    const mockTarget = createMockElement();
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
    expect(mockTarget.classList.add).toHaveBeenCalledWith("is-active");
    expect(mockButton.classList.add).toHaveBeenCalledWith("is-active");
  });

  test("handleOutsideClick hides all elements when clicking outside", () => {
    const mockEvent = { target: { closest: jest.fn().mockReturnValue(null) } };
    const hideAllSpy = jest.spyOn(revealer, "hideAll");

    revealer.handleOutsideClick(mockEvent);

    expect(hideAllSpy).toHaveBeenCalled();
  });

  test("handleEscapeKey hides all elements when pressing Escape", () => {
    const hideAllSpy = jest.spyOn(revealer, "hideAll");

    revealer.handleEscapeKey({ key: "Escape" });

    expect(hideAllSpy).toHaveBeenCalled();
  });

  test("hideAll calls toggleReveal for visible elements", () => {
    const mockButton = createMockElement();
    const mockTarget = createMockElement();
    mockTarget.getAttribute.mockReturnValue("false"); // visible
    mockDocument.getElementById.mockReturnValue(mockTarget);

    revealer.buttons = [mockButton];
    const toggleRevealSpy = jest.spyOn(revealer, "toggleReveal");

    revealer.hideAll();

    expect(toggleRevealSpy).toHaveBeenCalledWith(mockButton);
    expect(revealer.overlay.style.display).toBe("none");
    expect(revealer.activeTarget).toBeNull();
  });
});

function createMockElement() {
  return {
    getAttribute: jest.fn(),
    setAttribute: jest.fn(),
    hasAttribute: jest.fn(),
    classList: { add: jest.fn(), remove: jest.fn() },
    style: {},
  };
}
