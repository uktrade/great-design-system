const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');


require('dotenv').config();
const accessToken = process.env.ACCESS_TOKEN;
const fileId = process.env.FILE_ID;

const url = `https://api.figma.com/v1/files/${fileId}/variables/local`;

// Convert RGBA to Hex
const rgbaToHex = (r, g, b, a) => {
    const toHex = n => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(Math.round(a * 255))}`;
};

// Sanitise strings
const sanitizeVariableName = name => {
    name = name.toLowerCase()
               .replace(/\s+/g, '-')
               .replace(/\/+/g, '-')
               .replace(/\(|\)/g, '')
               .replace(/-{2,}/g, '-')
               .replace(/(\b\w+\b)(-\1)+/g, '$1')
               .replace(/,-/, '-')
               .replace(/-+$/, '');
    return name;
};

// Format SCSS variable
const formatVariable = (name, value) => `$${name}: ${value};\n`;

// Get the value of a variable, handling aliases and color objects
const getValue = (value, variables) => {
    if (typeof value === 'object' && value !== null) {
        if (value.type === 'VARIABLE_ALIAS') {
            const targetVariable = variables[value.id];
            return targetVariable ? `$${sanitizeVariableName(targetVariable.name)}` : null;
        } else if (value.r !== undefined) {
            return rgbaToHex(Math.round(value.r * 255), Math.round(value.g * 255), Math.round(value.b * 255), value.a);
        }
    } else if (typeof value === 'number') {
        return `${value}px`;
    } else if (typeof value === 'string') {
        return `"${value}"`;
    }
    return value;
};

// Categorise variables
const categoriseVariable = (variableName) => {
    if (/color|colour|tag/.test(variableName)) {
        return 'colors';
    } else if (/spacing|width/.test(variableName)) {
        return 'spacing';
    } else if (/font|type|typography|heading|paragraph/.test(variableName)) {
        return 'typography';
    } else {
        return 'components';
    }
};

// Topological sort for variable dependency resolution
const topologicalSort = (variables) => {
    const sorted = [];
    const visited = new Set();

    const visit = (variable) => {
        if (!visited.has(variable.name)) {
            visited.add(variable.name);
            const dependencies = Object.values(variable.valuesByMode)
                .filter(value => value.type === 'VARIABLE_ALIAS')
                .map(value => variables[value.id]);
            dependencies.forEach(visit);
            sorted.push(variable);
        }
    };

    Object.values(variables).forEach(visit);
    return sorted;
};

// Main function to fetch and process Figma tokens
const fetchAndProcessFigmaTokens = async () => {
    try {
        const response = await axios.get(url, { headers: { 'X-Figma-Token': accessToken } });
        const { variables, variableCollections } = response.data.meta;

        const scssDir = path.join(__dirname, '../scss/variables');
        await fs.mkdir(scssDir, { recursive: true });

        const files = {
            colors: path.join(scssDir, 'colors.scss'),
            typography: path.join(scssDir, 'typography.scss'),
            spacing: path.join(scssDir, 'spacing.scss'),
            components: path.join(scssDir, 'components.scss')
        };

        let content = { colors: '', typography: '', spacing: '', components: '' };
        const addedVariables = { colors: new Set(), typography: new Set(), spacing: new Set(), components: new Set() };

        // Create a map of mode IDs to mode names to lookup
        const modeIdToName = {};
        Object.values(variableCollections).forEach(collection => {
            collection.modes.forEach(mode => {
                modeIdToName[mode.modeId] = mode.name;
            });
        });

        const sortedVariables = topologicalSort(variables);

        sortedVariables.forEach(variable => {
            if (variable && variable.valuesByMode) {

                const modes = Object.keys(variable.valuesByMode);
                const values = Object.values(variable.valuesByMode);

                const allValuesSame = values.every(val => JSON.stringify(val) === JSON.stringify(values[0]));

                const variableName = sanitizeVariableName(variable.name);
                const category = categoriseVariable(variableName);

                if (allValuesSame) {
                    const value = getValue(values[0], variables);
                    if (!addedVariables[category].has(variableName)) {
                        content[category] += formatVariable(variableName, value);
                        addedVariables[category].add(variableName);
                    }
                } else {
                    modes.forEach((mode, index) => {
                        const modeName = modeIdToName[mode].toLowerCase();
                        const modeValue = getValue(values[index], variables);
                        const modeVariableName = index === 0 ? variableName : `${variableName}-${modeName}`;
                        if (!addedVariables[category].has(modeVariableName)) {
                            content[category] += formatVariable(modeVariableName, modeValue);
                            addedVariables[category].add(modeVariableName);
                        }
                    });
                }
            }
        });

        // Write each category content to its respective file
        await Promise.all(Object.entries(files).map(([category, filePath]) =>
            fs.writeFile(filePath, content[category], { flag: 'w' })));

        console.log('SCSS files have been created successfully.');
    } catch (error) {
        console.error('Error fetching data from Figma:', error);
    }
};

fetchAndProcessFigmaTokens();
