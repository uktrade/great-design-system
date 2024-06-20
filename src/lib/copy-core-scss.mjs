import glob from "glob";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scssSourceDir = path.join(__dirname, "../../src/scss");
const scssTargetDir = path.join(__dirname, "../../dist/scss");

const ensureDirExists = async (dir) => {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
};

const copyScssFiles = async () => {
  await ensureDirExists(scssTargetDir);

  glob(`${scssSourceDir}/**/*.scss`, async (err, scssFiles) => {
    if (err) {
      console.error("Error finding SCSS files:", err);
      return;
    }

    for (const scssFile of scssFiles) {
      const targetScssFilePath = path.join(
        scssTargetDir,
        path.relative(scssSourceDir, scssFile),
      );
      const targetScssDir = path.dirname(targetScssFilePath);

      try {
        await ensureDirExists(targetScssDir);
        await fs.copyFile(scssFile, targetScssFilePath);
        console.log(`Copied ${scssFile} to ${targetScssFilePath}`);
      } catch (error) {
        console.error(
          `Error copying ${scssFile} to ${targetScssFilePath}:`,
          error,
        );
      }
    }
  });
};

copyScssFiles();
