const Search = require("./search-autosuggest");

// Initialize search when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new Search());
} else {
  new Search();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".app-code-viewer__content").forEach((content) => {
    content.hidden = true;
  });

  const tabs = document.querySelectorAll(".app-code-viewer__tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const viewer = tab.closest(".app-code-viewer");
      const isSelected = tab.getAttribute("aria-selected") === "true";

      if (isSelected) {
        tab.setAttribute("aria-selected", "false");
        viewer
          .querySelectorAll(".app-code-viewer__content")
          .forEach((content) => {
            content.hidden = true;
          });
        return;
      }

      viewer.querySelectorAll(".app-code-viewer__tab").forEach((t) => {
        t.setAttribute("aria-selected", "false");
      });
      tab.setAttribute("aria-selected", "true");

      viewer
        .querySelectorAll(".app-code-viewer__content")
        .forEach((content) => {
          content.hidden = content.dataset.tabContent !== tab.dataset.tab;
        });
    });
  });

  // Add copy button functionality
  document.querySelectorAll(".app-copy-button").forEach((button) => {
    button.addEventListener("click", () => {
      const codeBlock = button.nextElementSibling.querySelector("code");
      const text = codeBlock.innerText;

      navigator.clipboard
        .writeText(text)
        .then(() => {
          // Visual feedback
          button.textContent = "Copied!";
          setTimeout(() => {
            button.textContent = "Copy code";
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
          button.textContent = "Failed to copy";
        });
    });
  });
});

// add event listeners to design system components
import { copyURLToClipboard } from "../../js/copy-url/copy-url.js";

export const addEventListenersToDSComponents = () => {
  const copyURLButton = document.getElementById("copy-url-button");

  if (copyURLButton) {
    copyURLButton.addEventListener("click", copyURLToClipboard);
  }
};

addEventListenersToDSComponents();

import { initAll } from "govuk-frontend";
initAll();

import "../../js/revealer/main.js";
