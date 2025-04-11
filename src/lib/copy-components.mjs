import glob from "glob";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, "../components");
const targetDir = path.join(__dirname, "../../dist/components");

function removeEmptyLines(str) {
  return str
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");
}

function convertNunjucksToHtml(
  content,
  options = { preserveLineBreaks: false },
) {
  const imports = {};
  let htmlContent = content;

  // Extract and store import statements
  htmlContent = htmlContent.replace(
    /{% from "([^"]+)" import ([^%]+) %}/g,
    (match, importPath, importedMacros) => {
      importedMacros.split(",").forEach((macro) => {
        const [macroName, alias] = macro.trim().split(" as ");
        imports[alias || macroName] = importPath.replace(".njk", ".html");
      });
      return ""; // Remove import statement from HTML content
    },
  );

  // Remove {% set ... %} blocks
  htmlContent = htmlContent.replace(/{% set [\s\S]*?%}/g, "");

  //Replace custom njk '|string' filter with the django default "|stringformat:'s'" filter
  htmlContent = htmlContent.replace(/string/g, "stringformat:'s'");

  //Replace custom njk 'loop.index' with the Django's forloop.counter
  htmlContent = htmlContent.replace(/loop.index/g, "forloop.counter");

  //Append '.items' on dict loop
  htmlContent = htmlContent.replace(
    /{% for name, value in attrs %}/g,
    "{% for name, value in attrs.items %}",
  );

  //Replace custom njk '|add(x)' filter with the django default '|add:x' filter
  htmlContent = htmlContent.replace(/add\((['"]?[-\w]+['"]?)\)/g, "add:$1");

  // Replace for.index etc with django syntax version
  htmlContent = htmlContent.replace(/loop\.index/g, "forloop.counter");
  htmlContent = htmlContent.replace(/loop\.index0/g, "forloop.counter0");
  htmlContent = htmlContent.replace(/loop\.first/g, "forloop.first");
  htmlContent = htmlContent.replace(/loop\.last/g, "forloop.last");
  htmlContent = htmlContent.replace(/loop\.length/g, "forloop.revcounter");

  // Replace macro calls with include statements
  htmlContent = htmlContent.replace(
    /{{ (\w+)\(([\s\S]*?)\) }}/g,
    (match, macroName, args) => {
      if (imports[macroName]) {
        // Only format args if we're not preserving line breaks
        const formattedArgs = options.preserveLineBreaks
          ? args.trim()
          : args.replace(/\s+/g, " ").replace(/,\s*/g, " ").trim();

        // Check if there are any arguments
        if (formattedArgs) {
          return `{% include "${imports[macroName]}" with ${formattedArgs} %}`;
        } else {
          return `{% include "${imports[macroName]}" %}`;
        }
      }
      return match;
    },
  );

  // Remove macro definitions but keep their content
  htmlContent = htmlContent.replace(
    /{% macro [^%]+%}([\s\S]*?){% endmacro %}/g,
    (match, macroContent) => {
      return macroContent.trim();
    },
  );

  // Convert .njk to .html in include statements and remove relative paths
  htmlContent = htmlContent.replace(
    /{%\s*include\s*"(?:\.\.\/)*(.+?)(?:\.njk|\.html)"\s*%}/g,
    (match, includePath) => {
      return `{% include "${includePath.split("/").pop()}.html" %}`;
    },
  );

  // Convert .njk to .html in include statements with parameters and remove relative paths
  htmlContent = htmlContent.replace(
    /{%\s*include\s*"(?:\.\.\/)*(.+?)(?:\.njk|\.html)"\s*with\s+([^%]+)\s*%}/g,
    (match, includePath, params) => {
      return `{% include "${includePath.split("/").pop()}.html" with ${params} %}`;
    },
  );

  // Clean the output before returning
  return removeEmptyLines(htmlContent);
}

glob(`${sourceDir}/*/_*.njk`, async (err, files) => {
  if (err) {
    console.error("Error finding Nunjucks files:", err);
    return;
  }

  console.log(`Files found: ${files.join(", ")}`);

  for (const file of files) {
    console.log(`Processing file: ${file}`);
    const componentName = path.basename(file, ".njk").replace("_", "");
    const componentDirName = path.dirname(file).split(path.sep).pop();
    const targetComponentDir = path.join(targetDir, componentDirName);

    try {
      await fs.mkdir(targetComponentDir, { recursive: true });

      const targetHtmlPath = path.join(
        targetComponentDir,
        `_${componentName}.html`,
      );
      const targetNjkPath = path.join(
        targetComponentDir,
        `_${componentName}.njk`,
      );

      // Read the Nunjucks file
      const content = await fs.readFile(file, "utf-8");

      // Copy the original Nunjucks file without changes
      await fs.writeFile(targetNjkPath, content, "utf8");
      console.log(`Copied original Nunjucks file to ${targetNjkPath}`);

      // Convert Nunjucks syntax for HTML file
      const htmlContent = convertNunjucksToHtml(content);

      // Write the converted content to the HTML file
      await fs.writeFile(targetHtmlPath, htmlContent, "utf8");
      console.log(`Wrote converted HTML content to ${targetHtmlPath}`);

      const scssFile = path.join(path.dirname(file), `_${componentName}.scss`);
      if (await fs.stat(scssFile).catch(() => false)) {
        const targetScssPath = path.join(
          targetComponentDir,
          `_${componentName}.scss`,
        );
        await fs.copyFile(scssFile, targetScssPath);
        console.log(`Copied ${scssFile} to ${targetScssPath}`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
});

export { convertNunjucksToHtml };
