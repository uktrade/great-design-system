import axios from "axios";
import path from "path";
import chalk from "chalk";

import dotenv from "dotenv";
dotenv.config();

const accessToken = process.env.ACCESS_TOKEN;
const fileId = process.env.FILE_ID;

const url = `https://api.figma.com/v1/files/${fileId}/versions`;

const fetchAndProcessFigmaHistory = async () => {
  try {
    console.log(chalk.blue("Starting the process to fetch Figma version history…"));

    const response = await axios.get(url, {
      headers: { "X-Figma-Token": accessToken },
    });

    console.log(chalk.green("Fetched data from Figma successfully."));

  } catch (error) {
    console.error(chalk.red("Error fetching data from Figma:", error));
  }
};

fetchAndProcessFigmaHistory();
