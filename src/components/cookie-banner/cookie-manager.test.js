describe("CookieManager", () => {
  let cookieManager;
  let documentCookies = "";

  beforeEach(() => {
    // Create mock document
    global.document = {};

    // Define cookie property with getter/setter
    Object.defineProperty(global.document, "cookie", {
      get: function () {
        return documentCookies;
      },
      set: function (value) {
        documentCookies = value;
      },
      configurable: true,
    });

    // Mock location
    global.location = { protocol: "https:" };

    const { CookieManager } = require("./cookie-manager");
    cookieManager = new CookieManager("test.com");
  });

  afterEach(() => {
    documentCookies = "";
    jest.restoreAllMocks();
  });

  describe("set", () => {
    test("sets cookie with correct attributes", () => {
      cookieManager.set("testCookie", "value");
      expect(document.cookie).toContain("testCookie=value");
      expect(document.cookie).toContain("domain=test.com");
    });

    test("sets expiry date correctly", () => {
      const mockDate = new Date("2024-01-01");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate);

      cookieManager.set("testCookie", "value", 1);

      expect(document.cookie).toContain(
        `expires=${new Date("2024-01-02").toGMTString()}`,
      );
    });
  });

  describe("get", () => {
    test("returns null for non-existent cookie", () => {
      expect(cookieManager.get("nonexistent")).toBeNull();
    });

    test("returns cookie value when exists", () => {
      cookieManager.set("testCookie", "value");
      expect(cookieManager.get("testCookie")).toBe("value");
    });
  });

  describe("policy management", () => {
    test("setPolicy creates correct policy object", () => {
      cookieManager.setPolicy(true, true, true);
      const expectedPolicy = {
        essential: true,
        settings: true,
        usage: true,
        campaigns: true,
      };
      expect(cookieManager.getPolicy()).toEqual(expectedPolicy);
    });

    test("getPolicy returns default policy when none exists", () => {
      expect(cookieManager.getPolicy()).toEqual({
        essential: true,
        settings: false,
        usage: false,
        campaigns: false,
      });
    });

    test("getPolicy returns existing policy", () => {
      const policy = {
        essential: true,
        settings: true,
        usage: false,
        campaigns: true,
      };
      document.cookie = `cookies_policy=${JSON.stringify(policy)}`;

      expect(cookieManager.getPolicy()).toEqual(policy);
    });
  });

  describe("preferences management", () => {
    test("setPreferences handles boolean values", () => {
      cookieManager.setPreferences(true);
      expect(cookieManager.getPreferences()).toBe("true");

      cookieManager.setPreferences(false);
      expect(cookieManager.getPreferences()).toBe("false");
    });

    test("getPreferences returns null when not set", () => {
      expect(cookieManager.getPreferences()).toBeNull();
    });

    test("getPreferences returns correct value", () => {
      document.cookie = "cookie_preferences_set=true";
      expect(cookieManager.getPreferences()).toBe("true");
    });
  });
});
