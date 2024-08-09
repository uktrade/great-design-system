import axios from "axios";
import chalk from "chalk";
import {
  sanitizeVariableName,
  topologicalSort,
  determineFilePath,
  handleVariableModes,
} from "./utils.mjs";
import { createDirectories, writeFiles } from "./write-scss-files.mjs";
import dotenv from "dotenv";

dotenv.config();
const accessToken = process.env.ACCESS_TOKEN;
const fileId = process.env.FILE_ID;

const url = `https://api.figma.com/v1/files/${fileId}/variables/local`;

const fetchAndProcessFigmaTokens = async () => {
  try {
    console.log(chalk.blue("Starting the process to fetch Figma tokens..."));

    const response = await axios.get(url, {
      headers: { "X-Figma-Token": accessToken },
    });

    console.log(chalk.green("Fetched data from Figma successfully."));

    const { variables, variableCollections } = response.data.meta;
    const { scssDir, colorsDir } = await createDirectories();

    const files = {};
    let content = {};
    const addedVariables = new Map();
    const variableIdToCollection = new Map();

    Object.values(variableCollections).forEach((collection) => {
      if (!collection.hiddenFromPublishing) {
        collection.variableIds.forEach((variableId) => {
          variableIdToCollection.set(variableId, collection.name);
        });
      }
    });

    const sortedVariables = topologicalSort(variables);

    sortedVariables.forEach((variable) => {
      if (!variable || !variable.valuesByMode || variable.hiddenFromPublishing)
        return;

      const collectionName = variableIdToCollection.get(variable.id);
      const valuesByMode = variable.valuesByMode;
      const modes = Object.keys(valuesByMode);

      let variableName = sanitizeVariableName(variable.name).replace(
        /-domestic/,
        "",
      );
      const category = variableName.split("-")[1];

      // Exclude the following groups as these are Figma specific but need to be published
      if (category === "width" || category === "viewport") return;

      const filePath = determineFilePath(
        collectionName,
        category,
        variableName,
        colorsDir,
        scssDir,
      );

      if (!files[filePath]) {
        files[filePath] = filePath;
        content[filePath] = "";
        addedVariables[filePath] = new Set();
      }

      handleVariableModes(
        modes,
        valuesByMode,
        variableName,
        variables,
        addedVariables[filePath],
        content,
        filePath,
      );
    });

    await writeFiles(files, content);
    console.log(chalk.green("SCSS files have been created successfully."));
  } catch (error) {
    console.error(chalk.red("Error fetching data from Figma:", error));
  }
};

fetchAndProcessFigmaTokens();
