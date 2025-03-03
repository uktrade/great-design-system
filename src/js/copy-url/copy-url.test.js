import { copyURLToClipboard } from "./copy-url";

beforeAll(() => {
  delete global.window;
  global.window = {
    location: {
      href: "https://mock-url.com",
      assign: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn(),
    },
  };

  Object.defineProperty(global, "navigator", {
    value: {
      clipboard: {
        writeText: jest.fn(),
      },
    },
    configurable: true,
  });
});

describe("copyURLToClipboard", () => {
  beforeAll(() => {
    navigator.clipboard.writeText.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should copy the current URL to clipboard on success", async () => {
    const mockURL = "https://mock-url.com";

    navigator.clipboard.writeText.mockResolvedValue(undefined);

    await copyURLToClipboard();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockURL);
  });

  it("should handle errors when the clipboard operation fails", async () => {
    const mockURL = "https://mock-url.com";

    navigator.clipboard.writeText.mockRejectedValueOnce(
      new Error("Clipboard access denied"),
    );

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation((message, error) => {
        console.log("console.log called:", message, error.message);
      });

    await copyURLToClipboard();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockURL);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to copy URL: ",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
