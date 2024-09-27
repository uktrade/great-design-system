import glob from "glob";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, "../components");
const targetDir = path.join(__dirname, "../../dist/components");

function convertNunjucksToHtml(content) {
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

  // Remove {% set ... %} blocks, including multiline ones
  htmlContent = htmlContent.replace(
    /{% set [\s\S]*?%}/g,
    "", // Remove the entire set block
  );

  // Replace macro calls with include statements
  htmlContent = htmlContent.replace(
    /{{ (\w+)\(([\s\S]*?)\) }}/g,
    (match, macroName, args) => {
      if (imports[macroName]) {
        // Remove line breaks, extra spaces, and commas from args
        const formattedArgs = args
          .replace(/\s+/g, " ")
          .replace(/,\s*/g, " ")
          .trim();

        // Check if there are any arguments
        if (formattedArgs) {
          return `{% include "${imports[macroName]}" with ${formattedArgs} %}`;
        } else {
          return `{% include "${imports[macroName]}" %}`;
        }
      }
      return match; // Keep the macro call if not found in imports
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

  return htmlContent;
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
