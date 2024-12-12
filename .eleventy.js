const nunjucks = require("nunjucks");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

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
