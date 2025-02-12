const lunr = require("lunr");

class Search {
  constructor() {
    this.input = document.querySelector("[data-great-ds-search-input]");
    this.resultsContainer = document.querySelector(
      "[data-great-ds-search-results]",
    );
    this.searchIndex = null;
    this.documents = null;
    this.minChars = 3;
    this.currentFocus = -1;
    this.selectedIndex = -1;
    this.resultsCount = 0;

    if (this.input && this.resultsContainer) {
      this.setupAccessibility();
      this.init();
    }

    // Add click outside listener
    document.addEventListener("click", this.handleClickOutside.bind(this));
    // Add escape key listener
    document.addEventListener("keydown", this.handleEscape.bind(this));
  }

  setupAccessibility() {
    // Add ARIA attributes to search input
    this.input.setAttribute("role", "combobox");
    this.input.setAttribute("aria-expanded", "false");
    this.input.setAttribute("aria-controls", "search-results");
    this.input.setAttribute("aria-label", "Search components");
    this.input.setAttribute("aria-describedby", "search-instructions");

    // Add instructions for screen readers
    const instructions = document.createElement("span");
    instructions.id = "search-instructions";
    instructions.className = "govuk-visually-hidden";
    instructions.textContent =
      "Type 3 or more characters to search. Use up and down arrows to review results.";
    this.input.parentNode.insertBefore(instructions, this.input);

    // Setup results container
    this.resultsContainer.setAttribute("role", "listbox");
    this.resultsContainer.id = "search-results";

    // Add keyboard navigation
    this.input.addEventListener("keydown", this.handleKeydown.bind(this));
  }

  handleKeydown(event) {
    const { key } = event;

    if (key === "Enter") {
      event.preventDefault();
      const selectedItem = document.querySelector(
        ".great-ds-header__search-autocomplete-results-item-link.selected",
      );
      if (selectedItem) {
        window.location.href = selectedItem.href;
      }
      return;
    }

    if (!["ArrowDown", "ArrowUp"].includes(key)) return;

    event.preventDefault();
    const items = document.querySelectorAll(
      ".great-ds-header__search-autocomplete-results-item",
    );
    if (!items.length) return;

    // Update index
    if (key === "ArrowDown") {
      this.selectedIndex =
        this.selectedIndex >= items.length - 1 ? 0 : this.selectedIndex + 1;
    } else {
      this.selectedIndex =
        this.selectedIndex <= 0 ? items.length - 1 : this.selectedIndex - 1;
    }

    // Remove all selections
    items.forEach((item) => {
      const link = item.querySelector("a");
      link.classList.remove("selected");
      link.setAttribute("aria-selected", "false");
    });

    // Add selection to current item and its link
    const selectedItem = items[this.selectedIndex];
    const selectedLink = selectedItem.querySelector("a");
    selectedLink.classList.add("selected");
    selectedLink.setAttribute("aria-selected", "true");
  }

  async init() {
    try {
      const [indexResponse, documentsResponse] = await Promise.all([
        fetch("/search-index.json"),
        fetch("/search-documents.json"),
      ]);

      this.searchIndex = lunr.Index.load(await indexResponse.json());
      this.documents = await documentsResponse.json();
      this.input.addEventListener("input", this.search.bind(this));
    } catch (error) {
      console.error("Error initializing search:", error);
    }
  }

  search(event) {
    const query = event.target.value.trim();

    if (query.length < this.minChars) {
      this.resultsContainer.hidden = true;
      this.input.setAttribute("aria-expanded", "false");
      return;
    }

    try {
      const terms = query.toLowerCase().split(/\s+/);
      const searchQueries = terms.map((term) => [
        // Exact matches get highest boost
        `title:${term}^15`,
        `synonyms:${term}^12`,

        // Prefix matches get medium boost
        `title:${term}*^10`,
        `synonyms:${term}*^8`,

        // Fuzzy matches get lower boost
        `title:${term}~1^5`,
        `synonyms:${term}~1^4`,
      ]);

      const searchQuery = searchQueries
        .map((termQueries) => termQueries.join(" OR "))
        .join(" AND ");

      const results = this.searchIndex.search(searchQuery);

      if (results.length > 0) {
        const html = `<ul class="great-ds-header__search-autocomplete-results-list">${results
          .slice(0, 5)
          .map((result, index) => {
            const doc = this.documents[result.ref];
            return `<li class="great-ds-header__search-autocomplete-results-item ${index === this.selectedIndex ? "selected" : ""}">
                        <a href="${doc.url}" 
                            class="great-ds-header__search-autocomplete-results-item-link" 
                            role="option" 
                            id="search-result-${index}"
                            tabindex="-1"
                            aria-selected="false">
                            <span class="great-ds-header__search-autocomplete-results-item-link-text">${doc.title}</span>
                            <span class="great-ds-header__search-autocomplete-results-item-link-type">${doc.type}</span>
                        </a>
                    </li>`;
          })
          .join("")}</ul>`;

        this.resultsContainer.innerHTML = html;
        this.resultsContainer.hidden = false;
        this.input.setAttribute("aria-expanded", "true");

        // Announce results count
        const liveRegion =
          document.getElementById("search-live-region") ||
          this.createLiveRegion();
        liveRegion.textContent = `${results.length} results available.`;
      } else {
        this.resultsContainer.innerHTML = `
          <div class="great-ds-header__search-autocomplete-results-list">
            <div class="great-ds-header__search-autocomplete-results-item">
              <div class="great-ds-header__search-autocomplete-results-item-link">
                <p class="great-ds-header__search-autocomplete-results-item-link-text" role="status">
                  No results found
                </p>
              </div>
            </div>
          </div>`;
        this.resultsContainer.hidden = false;
        this.input.setAttribute("aria-expanded", "true");
      }
    } catch (error) {
      console.error("Search error:", error);
      this.resultsContainer.hidden = true;
      this.input.setAttribute("aria-expanded", "false");
    }
  }

  createLiveRegion() {
    const liveRegion = document.createElement("div");
    liveRegion.id = "search-live-region";
    liveRegion.className = "govuk-visually-hidden";
    liveRegion.setAttribute("aria-live", "polite");
    document.body.appendChild(liveRegion);
    return liveRegion;
  }

  handleEscape(event) {
    if (event.key === "Escape") {
      this.clearResults();
    }
  }

  handleClickOutside(event) {
    const searchContainer = document.querySelector(
      ".great-ds-header__search-autocomplete",
    );
    if (searchContainer && !searchContainer.contains(event.target)) {
      this.clearResults();
    }
  }

  clearResults() {
    this.resultsContainer.hidden = true;
    this.selectedIndex = -1;
  }
}

module.exports = Search;
