import axios from "axios";
import path from "path";
import chalk from "chalk";
import {
  sanitizeVariableName,
  topologicalSort,
  getValue,
  formatVariable,
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

    const { scssDir, componentsDir } = await createDirectories();

    const files = {};
    let content = {};
    const addedVariables = {};
    const modeIdToName = {};
    const variableIdToCollection = {};

    if (variableCollections) {
      Object.values(variableCollections).forEach((collection) => {
        if (collection.modes) {
          collection.modes.forEach((mode) => {
            modeIdToName[mode.modeId] = mode.name;
          });
        }
        if (collection.variableIds) {
          collection.variableIds.forEach((variableId) => {
            variableIdToCollection[variableId] = collection.name;
          });
        }
      });
    }

    const sortedVariables = topologicalSort(variables);

    sortedVariables.forEach((variable) => {
      if (variable && variable.valuesByMode) {
        const collectionName = variableIdToCollection[variable.id];
        const modes = Object.keys(variable.valuesByMode);
        const values = Object.values(variable.valuesByMode);

        const allValuesSame = values.every(
          (val) => JSON.stringify(val) === JSON.stringify(values[0]),
        );

        const variableName = sanitizeVariableName(variable.name);
        const category =
          collectionName === "Components"
            ? variableName.split("-")[1]
            : variableName.split("-")[1];

        const dirPath =
          collectionName === "Components" ? componentsDir : scssDir;
        const filePath = path.join(dirPath, `${category}.scss`);

        if (!files[filePath]) {
          files[filePath] = filePath;
          content[filePath] = "";
          addedVariables[filePath] = new Set();
        }

        if (allValuesSame) {
          const value = getValue(values[0], variables);
          if (!addedVariables[filePath].has(variableName)) {
            content[filePath] += formatVariable(`$${variableName}`, value);
            addedVariables[filePath].add(variableName);
          }
        } else {
          modes.forEach((mode, index) => {
            const modeName = modeIdToName[mode]
              ? modeIdToName[mode].toLowerCase()
              : "";
            const modeValue = getValue(values[index], variables);
            const modeVariableName =
              index !== 0 ? `${variableName}` : `${variableName}-${modeName}`;
            if (!addedVariables[filePath].has(modeVariableName)) {
              content[filePath] += formatVariable(
                `$${modeVariableName}`,
                modeValue,
              );
              addedVariables[filePath].add(modeVariableName);
            }
          });
        }
      }
    });

    await writeFiles(files, content);

    console.log(chalk.green("SCSS files have been created successfully."));
  } catch (error) {
    console.error(chalk.red("Error fetching data from Figma:", error));
  }
};

fetchAndProcessFigmaTokens();
