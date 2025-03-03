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

import { copyUrlToClipboard } from "./copy-url/copy-url.js";

export const addCopyURLEventListeners = () => {
  const button = document.getElementById("copy-url-button");

  if (button) {
    button.addEventListener("click", copyUrlToClipboard);
  }
};

initCookieNotice();
addCopyURLEventListeners();
