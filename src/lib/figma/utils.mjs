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
