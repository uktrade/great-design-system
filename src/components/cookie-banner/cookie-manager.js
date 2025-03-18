export class CookieManager {
  constructor(domain = window.location.hostname) {
    this.domain = domain;
  }

  set(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    let cookieString = `${name}=${value}; domain=${this.domain}; path=/; expires=${date.toGMTString()}`;

    if (location.protocol === "https:") {
      cookieString += "; Secure";
    }

    document.cookie = cookieString;
  }

  get(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
      let c = cookie;
      while (c.charAt(0) === " ") c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  setPolicy(settings = false, usage = false, campaigns = false) {
    const policy = {
      essential: true,
      settings,
      usage,
      campaigns,
    };
    this.set("cookies_policy", JSON.stringify(policy));
  }

  getPolicy() {
    const policy = this.get("cookies_policy");
    if (!policy) {
      return {
        essential: true,
        settings: false,
        usage: false,
        campaigns: false,
      };
    }
    return JSON.parse(policy);
  }

  setPreferences(value = true) {
    this.set("cookie_preferences_set", value.toString());
  }

  getPreferences() {
    return this.get("cookie_preferences_set");
  }
}

window.GreatDS = window.GreatDS || {};
window.GreatDS.cookieManager = new CookieManager();
