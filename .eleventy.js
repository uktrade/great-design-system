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
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    eleventyConfig.addShortcode("exampleWithCode", async function(src, componentName, width="100%", height="100%") {
        try {
            // Read example file
            const examplePath = path.join(__dirname, 'src/pages/components', componentName, `${componentName}-example.njk`);
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
            let htmlContent = fullHtml;
            const componentMatch = fullHtml.match(/(<div[^>]*class="[^"]*(?:govuk|great)[^"]*"[^>]*>[\s\S]*?<\/div>)\s*(?=<\/body>|<script)/i);
            if (componentMatch) {
                htmlContent = componentMatch[0];
            }

            // Generate Django version
            const { convertNunjucksToHtml } = await import('./src/lib/copy-components.mjs');
            const djangoContent = await convertNunjucksToHtml(nunjucksContent, { preserveLineBreaks: true });

            // Escape all content
            const escaped = {
                nunjucks: escapeHtml(nunjucksContent),
                django: escapeHtml(djangoContent),
                html: escapeHtml(htmlContent)
            };

            return `<div class="app-example">
                <div class="app-open-component">
                    <a href="${src}" class="app-open-component__link" target="_blank">Open in new tab</a>
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
                        <pre><code class="language-twig">${escaped.nunjucks}</code></pre>
                    </div>
                    <div class="app-code-viewer__content" data-tab-content="django" hidden>
                        <pre><code class="language-django">${escaped.django}</code></pre>
                    </div>
                    <div class="app-code-viewer__content" data-tab-content="html" hidden>
                        <pre><code class="language-html">${escaped.html}</code></pre>
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
