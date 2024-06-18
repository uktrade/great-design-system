const glob = require('glob');
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../components');
const targetDir = path.join(__dirname, '../../dist/components');

glob(`${sourceDir}/*/_*.njk`, (err, files) => {
  if (err) {
    console.error('Error finding Nunjucks files:', err);
    return;
  }

  console.log(`Files found: ${files.join(', ')}`);

  files.forEach(file => {
    const componentName = path.basename(file, '.njk').replace('_', '');
    const componentDirName = path.dirname(file).split(path.sep).pop();
    const targetComponentDir = path.join(targetDir, componentDirName);

    if (!fs.existsSync(targetComponentDir)) {
      fs.mkdirSync(targetComponentDir, { recursive: true });
    }

    const targetHtmlPath = path.join(targetComponentDir, `${componentName}.html`);
    const targetNjkPath = path.join(targetComponentDir, `_${componentName}.njk`);

    fs.copyFileSync(file, targetHtmlPath);
    console.log(`Copied and renamed ${file} to ${targetHtmlPath}`);

    fs.copyFileSync(file, targetNjkPath);
    console.log(`Copied ${file} to ${targetNjkPath}`);

    const scssFile = path.join(path.dirname(file), `_${componentName}.scss`);
    if (fs.existsSync(scssFile)) {
      const targetScssPath = path.join(targetComponentDir, `${componentName}.scss`);
      fs.copyFileSync(scssFile, targetScssPath);
      console.log(`Copied ${scssFile} to ${targetScssPath}`);
    }
  });
});
