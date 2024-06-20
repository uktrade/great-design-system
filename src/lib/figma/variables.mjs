import fs from "fs/promises";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { diffLines } from "diff";
import Table from "cli-table3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createDirectories = async () => {
  const scssDir = path.join(__dirname, "../../scss/variables");
  await fs.mkdir(scssDir, { recursive: true });
  console.log(chalk.blue(`Created directory: ${scssDir}`));

  const componentsDir = path.join(scssDir, "components");
  await fs.mkdir(componentsDir, { recursive: true });
  console.log(chalk.blue(`Created directory: ${componentsDir}`));

  return { scssDir, componentsDir };
};

const readFileContent = async (filePath) => {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
};

const normalizeContent = (content) =>
  content
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

const logDifferences = (oldContent, newContent, filePath) => {
  const normalizedOldContent = normalizeContent(oldContent);
  const normalizedNewContent = normalizeContent(newContent);

  const differences = diffLines(normalizedOldContent, normalizedNewContent);
  const table = new Table({
    head: ["Type", "Content"],
    colWidths: [10, 60],
  });

  differences.forEach((part) => {
    const type = part.added ? "Added" : part.removed ? "Removed" : "Unchanged";
    const color = part.added ? "green" : part.removed ? "red" : "grey";
    table.push([chalk[color](type), chalk[color](part.value)]);
  });

  console.log(chalk.yellow(`Differences for ${filePath}:`));
  console.log(table.toString());
};

export const writeFiles = async (files, content) => {
  console.log(chalk.blue("Writing SCSS files..."));
  await Promise.all(
    Object.entries(files).map(async ([filePath]) => {
      const newContent = content[filePath];
      const oldContent = await readFileContent(filePath);
      if (oldContent !== newContent) {
        logDifferences(oldContent, newContent, filePath);
        await fs.writeFile(filePath, newContent, { flag: "w" });
        console.log(chalk.green(`Written file: ${filePath}`));
      } else {
        console.log(chalk.green(`No changes for file: ${filePath}`));
      }
    }),
  );
};
