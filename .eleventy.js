const nunjucks = require("nunjucks");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "src/static": "static" });

    eleventyConfig.addGlobalData("eleventyComputed", {
        permalink: (data) => {
            if (data.page.filePathStem === "/pages/index") {
                return `/index.html`;
            } 
            else if (data.page.filePathStem.endsWith("/index")) {
                const newPath = data.page.filePathStem.replace(/^\/pages/, '').replace(/\/index$/, '');
                return `${newPath}/index.html`;
            }
            else if(data.page.filePathStem.startsWith("/pages")) {
                const newPath = data.page.filePathStem.replace(/^\/pages/, '');
                return `${newPath}/index.html`;
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

    eleventyConfig.addNunjucksFilter("component", function(componentName, data) {
        const relativePath = `src/components/${componentName}/_${componentName}.njk`;
        const renderedString = this.env.renderString(`{% include "${relativePath}" %}`, data);

        return new nunjucks.runtime.SafeString(renderedString);
    });

    eleventyConfig.addShortcode("exampleIframe", function(src, width="100%", height="100%") {
        return `<div class="app-iframe-wrapper"><iframe src="${src}" frameborder="0" width="${width}" height="${height}"></iframe></div>`;
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
