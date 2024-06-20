import glob from "glob";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, "../components");
const targetDir = path.join(__dirname, "../../dist/components");

glob(`${sourceDir}/*/_*.njk`, async (err, files) => {
  if (err) {
    console.error("Error finding Nunjucks files:", err);
    return;
  }

  console.log(`Files found: ${files.join(", ")}`);

  for (const file of files) {
    const componentName = path.basename(file, ".njk").replace("_", "");
    const componentDirName = path.dirname(file).split(path.sep).pop();
    const targetComponentDir = path.join(targetDir, componentDirName);

    try {
      await fs.mkdir(targetComponentDir, { recursive: true });

      const targetHtmlPath = path.join(
        targetComponentDir,
        `${componentName}.html`,
      );
      const targetNjkPath = path.join(
        targetComponentDir,
        `_${componentName}.njk`,
      );

      await fs.copyFile(file, targetHtmlPath);
      console.log(`Copied and renamed ${file} to ${targetHtmlPath}`);

      await fs.copyFile(file, targetNjkPath);
      console.log(`Copied ${file} to ${targetNjkPath}`);

      const scssFile = path.join(path.dirname(file), `_${componentName}.scss`);
      if (await fs.stat(scssFile).catch(() => false)) {
        const targetScssPath = path.join(
          targetComponentDir,
          `${componentName}.scss`,
        );
        await fs.copyFile(scssFile, targetScssPath);
        console.log(`Copied ${scssFile} to ${targetScssPath}`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
});
