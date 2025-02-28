import { initAll } from "govuk-frontend";
initAll();

import "./revealer/main.js";

import { CookieNotice } from "../components/cookie-banner/cookie-notice";

export const initCookieNotice = (options = {}) => {
  const modal = document.getElementById("cookie-modal");
  const banner = document.getElementById("cookie-banner");

  if (!modal || !banner) {
    return null;
  }

  return new CookieNotice(options);
};

export const copyUrlToClipboard = (element) => {};

initCookieNotice();
