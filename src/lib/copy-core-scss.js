const glob = require('glob');
const fs = require('fs');
const path = require('path');

const scssSourceDir = path.join(__dirname, '../../src/scss');
const scssTargetDir = path.join(__dirname, '../../dist/scss');

if (!fs.existsSync(scssTargetDir)) {
  fs.mkdirSync(scssTargetDir, { recursive: true });
}

glob(`${scssSourceDir}/**/*.scss`, (err, scssFiles) => {
  if (err) {
    console.error('Error finding SCSS files:', err);
    return;
  }
  scssFiles.forEach(scssFile => {
    const targetScssFilePath = path.join(scssTargetDir, path.relative(scssSourceDir, scssFile));
    const targetScssDir = path.dirname(targetScssFilePath);
    
    if (!fs.existsSync(targetScssDir)) {
      fs.mkdirSync(targetScssDir, { recursive: true });
    }

    fs.copyFileSync(scssFile, targetScssFilePath);
    console.log(`Copied ${scssFile} to ${targetScssFilePath}`);
  });
});
