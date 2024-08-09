import path from "path";

export const sanitizeVariableName = (name) => {
  name = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\/+/g, "-")
    .replace(/\(|\)/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/(\b\w+\b)(-\1)+/g, "$1")
    .replace(/,-/, "-")
    .replace(/-+$/, "");
  return `great-${name}`;
};

export const rgbaToHex = (r, g, b, a) => {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(Math.round(a * 255))}`;
};

export const topologicalSort = (variables) => {
  const sorted = [];
  const visited = new Set();

  const visit = (variable) => {
    if (variable && !visited.has(variable.name)) {
      visited.add(variable.name);
      const dependencies = Object.values(variable.valuesByMode)
        .filter((value) => value.type === "VARIABLE_ALIAS")
        .map((value) => variables[value.id])
        .filter((v) => v !== undefined);
      dependencies.forEach(visit);
      sorted.push(variable);
    }
  };

  Object.values(variables).forEach(visit);
  return sorted;
};

export const getValue = (value, variables) => {
  if (typeof value === "object" && value !== null) {
    if (value.type === "VARIABLE_ALIAS") {
      const targetVariable = variables[value.id];
      return targetVariable
        ? `$${sanitizeVariableName(targetVariable.name)}`
        : null;
    } else if (value.r !== undefined) {
      return rgbaToHex(
        Math.round(value.r * 255),
        Math.round(value.g * 255),
        Math.round(value.b * 255),
        value.a,
      );
    }
  } else if (typeof value === "number") {
    return `${value}px`;
  } else if (typeof value === "string") {
    return `"${value}"`;
  }
  return value;
};

export const formatVariable = (name, value) => `${name}: ${value};\n`;

export const determineFilePath = (
  collectionName,
  category,
  variableName,
  colorsDir,
  scssDir,
) => {
  let filePath;
  if (collectionName === "Color") {
    if (variableName.includes("primitive")) {
      filePath = path.join(colorsDir, "color-primitives.scss");
    } else if (variableName.includes("semantic")) {
      const parts = variableName.split("-");
      const thirdWord = parts.length > 2 ? parts[2] : "semantic";
      filePath = path.join(colorsDir, `${thirdWord}.scss`);
    } else {
      filePath = path.join(colorsDir, `${category}.scss`);
    }
  } else {
    filePath = path.join(scssDir, `${category}.scss`);
  }
  return filePath;
};

export const handleVariableModes = (
  modes,
  valuesByMode,
  variableName,
  variables,
  addedVariables,
  content,
  filePath,
) => {
  if (modes.length > 1) {
    const [firstMode, secondMode] = modes.slice(0, 2);
    const firstModeValue = getValue(valuesByMode[firstMode], variables);
    const secondModeValue = getValue(valuesByMode[secondMode], variables);

    if (firstModeValue !== undefined && secondModeValue !== undefined) {
      if (firstModeValue === secondModeValue) {
        if (!addedVariables.has(variableName)) {
          content[filePath] += formatVariable(
            `$${variableName}`,
            firstModeValue,
          );
          addedVariables.add(variableName);
        }
      } else {
        if (!addedVariables.has(variableName)) {
          content[filePath] += formatVariable(
            `$${variableName}`,
            secondModeValue,
          );
          addedVariables.add(variableName);
        }
        if (!addedVariables.has(`${variableName}-large`)) {
          content[filePath] += formatVariable(
            `$${variableName}-large`,
            firstModeValue,
          );
          addedVariables.add(`${variableName}-large`);
        }
      }
    }
  } else {
    const value = getValue(valuesByMode[modes[0]], variables);
    if (value !== undefined && !addedVariables.has(variableName)) {
      content[filePath] += formatVariable(`$${variableName}`, value);
      addedVariables.add(variableName);
    }
  }
};
