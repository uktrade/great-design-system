export const autocomplete = (event) => {
  const autocompleteElement = document.getElementById("great-ds-autocomplete");
  const autocompleteInput = document.getElementById(
    "great-ds-autocomplete__input",
  );
  const autocompleteResults = document.getElementById(
    "great-ds-autocomplete__results",
  );
  const query = event.target.value.trim();
  const matches = [];

  autocompleteResults.innerHTML = "";

  if (autocompleteElement.hasAttribute("data-json")) {
    const jsonData = JSON.parse(autocompleteElement.getAttribute("data-json"));

    if (query.length < 3) {
      autocompleteResults.hidden = true;
      autocompleteInput.setAttribute("aria-expanded", "false");
      return;
    }

    const regex = new RegExp(query, "i");
    const dataItems = jsonData.data;

    dataItems.forEach((item) => {
      Object.entries(item).forEach((value) => {
        console.log(item);
        if (typeof value == "string" && value.match(regex)) {
          matches.push(item);
        }
      });
    });
  }

  console.log(matches);
};
