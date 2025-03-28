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
  return `great-ds-${name}`;
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
  // Extract the semantic type if this is a semantic variable
  const semanticMatch = variableName.match(/^great-ds-semantic-(\w+)-/);
  const semanticType = semanticMatch ? semanticMatch[1] : null;

  if (collectionName === "Color") {
    if (variableName.startsWith("great-ds-primitive")) {
      return path.join(colorsDir, "color-primitives.scss");
    } else if (semanticType) {
      switch (semanticType) {
        case "text":
          return path.join(colorsDir, "text.scss");
        case "border":
          return path.join(colorsDir, "border.scss");
        case "interaction":
          return path.join(colorsDir, "interaction.scss");
        case "surface":
          return path.join(colorsDir, "surface.scss");
        default:
          return null;
      }
    } else {
      return path.join(colorsDir, "color-primitives.scss");
    }
  } else {
    if (variableName.includes("type")) {
      return path.join(scssDir, "type.scss");
    } else if (variableName.includes("spacing")) {
      return path.join(scssDir, "spacing.scss");
    } else if (variableName.includes("padding")) {
      return path.join(scssDir, "padding.scss");
    } else if (variableName.includes("icon")) {
      return path.join(scssDir, "icon.scss");
    } else if (variableName.includes("width")) {
      return path.join(scssDir, "padding.scss");
    }
  }

  return null;
};

export const shouldUseBothModes = (variableName) => {
  return (
    (variableName.includes("type") &&
      (variableName.includes("size") ||
        variableName.includes("line-height"))) ||
    variableName.includes("spacing") ||
    variableName.includes("padding")
  );
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
  if (shouldUseBothModes(variableName) && modes.length > 1) {
    const [firstMode, secondMode] = modes.slice(0, 2);
    const firstModeValue = getValue(valuesByMode[firstMode], variables);
    const secondModeValue = getValue(valuesByMode[secondMode], variables);

    if (firstModeValue !== undefined && secondModeValue !== undefined) {
      if (firstModeValue === secondModeValue) {
        // If both values are the same, just add one variable
        if (!addedVariables.has(variableName)) {
          content[filePath] += formatVariable(
            `$${variableName}`,
            firstModeValue,
          );
          addedVariables.add(variableName);
        }
      } else {
        // If values are different, add both regular and -large variables
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
    // For other variables, use the first mode
    const value = getValue(valuesByMode[modes[0]], variables);
    if (value !== undefined && !addedVariables.has(variableName)) {
      content[filePath] += formatVariable(`$${variableName}`, value);
      addedVariables.add(variableName);
    }
  }
};
