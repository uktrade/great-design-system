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
});
