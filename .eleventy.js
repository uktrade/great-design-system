const nunjucks = require("nunjucks");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const path = require('path');
const fs = require('fs');

module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "src/static": "static" });
    eleventyConfig.addPlugin(eleventyNavigationPlugin);

    eleventyConfig.addGlobalData("eleventyComputed", {
        permalink: (data) => {
            if (data.page.filePathStem === "/pages/index") {
                return `/index.html`;
            } 
            else if (data.page.filePathStem.endsWith("/index")) {
                const newPath = data.page.filePathStem.replace(/^\/pages/, '');
                return `${newPath}.html`;
            }
            else if(data.page.filePathStem.startsWith("/pages")) {
                const newPath = data.page.filePathStem.replace(/^\/pages/, '');
                return `${newPath}.html`;
            }
            return data.permalink;
        }
    });

    eleventyConfig.addCollection("componentIndexes", function(collectionApi) {
        return collectionApi.getAll().filter(function(item) {
          const regex = /^\.\/src\/pages\/components\/[^\/]+\/index\.njk$/;
          return regex.test(item.inputPath);
        });
    });

    eleventyConfig.addShortcode("exampleIframe", function(src, width="100%", height="100%") {
        return `<div class="app-iframe-wrapper" style="resize: both; overflow: auto;">
                    <iframe src="${src}" frameborder="0" style="width: ${width}; height: ${height};"></iframe>
                </div>`;
    });

    const escapeHtml = (unsafe) => {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    function removeEmptyLines(str) {
      // Split into lines, filter out completely empty lines, and rejoin
      return str
        .split('\n')
        .filter(line => !/^\s*$/.test(line))  // Only remove lines that are entirely whitespace
        .join('\n');
    }

    eleventyConfig.addShortcode("exampleWithCode", async function(src, componentName, width="100%", height="100%") {
        try {
            // Clean up the src path and remove trailing slash
            const cleanSrc = src.replace(/\/$/, '');
            
            // Read example file using the full path
            const examplePath = path.join(__dirname, 'src/pages', cleanSrc + '.njk');
            console.log('Looking for file at:', examplePath);
            let rawContent = fs.readFileSync(examplePath, 'utf8');

            // Get content between {% block content %} and {% endblock %}
            let nunjucksContent = '';
            const contentMatches = rawContent.match(/{% block content %}([\s\S]*?){% endblock %}/);
            
            if (contentMatches && contentMatches[1]) {
                nunjucksContent = contentMatches[1]
                    .replace(/{% extends [^}]*%}/g, '') // Remove extends
                    .trim();
            }

            // Configure nunjucks
            const env = nunjucks.configure([
                'src/_includes',
                'src/pages',
                'src/components',
                'src'
            ].map(dir => path.join(__dirname, dir)), {
                autoescape: true
            });

            // Generate HTML
            const fullHtml = env.render(examplePath, { collections: this.ctx.collections });
            
            // Extract component HTML
            const componentMatch = fullHtml.match(/(<(?:div|a|button|input|details|footer|header|picture)[^>]*class="[^"]*(?:govuk|great)[^"]*"(?:[^>]*>[\s\S]*?<\/(?:div|a|button|details|header|footer|picture)>|[^>]*\/>))\s*(?=<\/body>|<script)/i);
            const htmlContent = componentMatch ? removeEmptyLines(componentMatch[1]) : '';

            // Generate Django version
            const { convertNunjucksToHtml } = await import('./src/lib/copy-components.mjs');
            const djangoContent = await convertNunjucksToHtml(nunjucksContent, { preserveLineBreaks: true });

            // Escape all content with null checks
            const escaped = {
                nunjucks: escapeHtml(nunjucksContent || ''),
                django: escapeHtml(djangoContent || ''),
                html: escapeHtml(htmlContent || '')
            };

            return `<div class="app-example">
                <div class="app-open-component">
                    <a href="${src}" class="app-open-component__link govuk-link govuk-link--no-visited-state" target="_blank">Open in new tab</a>
                </div>
                <div class="app-iframe-wrapper" style="resize: both; overflow: auto;">
                    <iframe src="${src}" frameborder="0" style="width: ${width}; height: ${height};"></iframe>
                </div>
                <div class="app-code-viewer">
                    <div class="app-code-viewer__tabs" role="tablist">
                        <button class="app-code-viewer__tab" role="tab" aria-selected="false" data-tab="nunjucks">Nunjucks</button>
                        <button class="app-code-viewer__tab" role="tab" aria-selected="false" data-tab="django">Django</button>
                        <button class="app-code-viewer__tab" role="tab" aria-selected="false" data-tab="html">HTML</button>
                    </div>
                    <div class="app-code-viewer__content" data-tab-content="nunjucks">
                        <button class="app-copy-button great-ds-button--secondary great-ds-button--inline" aria-label="Copy Nunjucks code">Copy code</button>
                        <pre tabindex="0"><code class="language-twig">${escaped.nunjucks}</code></pre>
                    </div>
                    <div class="app-code-viewer__content" data-tab-content="django" hidden>
                        <button class="app-copy-button great-ds-button--secondary great-ds-button--inline" aria-label="Copy Django code">Copy code</button>
                        <pre tabindex="0"><code class="language-django">${escaped.django}</code></pre>
                    </div>
                    <div class="app-code-viewer__content" data-tab-content="html" hidden>
                        <button class="app-copy-button great-ds-button--secondary great-ds-button--inline" aria-label="Copy HTML code">Copy code</button>
                        <pre tabindex="0"><code class="language-html">${escaped.html}</code></pre>
                    </div>
                </div>
            </div>`;

        } catch (err) {
            console.error(`Error processing component ${componentName}:`, err);
            return `<div class="app-example">Error: ${err.message}</div>`;
        }
    });

    eleventyConfig.addFilter("debug", function(value) {
        return JSON.stringify(value, null, 2);
    });

    return {
        dir: {
            input: "src",
            includes: "_includes",
            data: "_data",
            output: "dist"
        }
    };
};
