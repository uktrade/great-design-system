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

    let figmaVersion = await response.data.versions;
      //console.log(figmaVersion);
			let output = JSON.stringify(figmaVersion, null, 2);
            
			let verContent = JSON.parse(output);

			// console.log((chalk.cyan("Version label: "+figmaVersion[i].label))+"\nDescription:\n"+figmaVersion[i].description);

      // figmaVersion.forEach((verItem) => console.log("Release: "+verItem.label+
      // "\nDescription:\n"+verItem.description+
      // "\nOn: "+verItem.created_at+
      // "\nBy: "+verItem.user.handle+"\n"));
      
      figmaVersion.forEach(nonNull);

      function nonNull(figmaVersion, index) {
        if(figmaVersion.label!==null){
          console.log(chalk.cyan("Release: ")+figmaVersion.label+
            chalk.cyan("\nDescription:\n")+figmaVersion.description+
            chalk.cyan("\nOn: ")+figmaVersion.created_at+
            chalk.cyan("\nBy: ")+figmaVersion.user.handle+"\n");
        }
      }


    console.log(chalk.green("Fetched version history data from Figma successfully."));

  } catch (error) {
    console.error(chalk.red("Error fetching data from Figma:", error));
  }
};

fetchAndProcessFigmaHistory();
