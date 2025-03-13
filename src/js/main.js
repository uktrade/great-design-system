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

import { copyURLToClipboard } from "./copy-url/copy-url.js";

export const addEventListenersToDSComponents = () => {
  const copyURLButton = document.getElementById("copy-url-button");

  if (copyURLButton) {
    copyURLButton.addEventListener("click", copyURLToClipboard);
  }
};

initCookieNotice();
addEventListenersToDSComponents();
