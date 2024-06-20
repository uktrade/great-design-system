# Great Design System

## Overview

The Great Design System provides markup, SCSS and JS in the form of layouts, styling and components. Everything you need to build a front end in your application that is accessible, consistent and efficient. 

The application serves two main purposes:

1. **Static site**: Generated using Eleventy (11ty) to provide documentation on design system components and patterns.
2. **Design system frontend**: Publishes the design system code to npm for consumption in other applications.

## Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 20.9.0
- **npm**: Version 10.1.0
- **nvm** (Node Version Manager): Recommended for managing Node.js versions

### Using nvm

To install `nvm`, follow the instructions from the [nvm repository](https://github.com/nvm-sh/nvm#installing-and-updating).

Once `nvm` is installed, you can use it to install the required Node.js version:

```bash
nvm install 20.9.0
nvm use 20.9.0
```

## Setup

**Clone the repository**:

```bash
git clone https://github.com/uktrade/great-design-system.git

cd great-design-system
```
**Install dependencies**:

```bash 
npm install
```

## Static Site

The static site provides documentation for the design system and is generated using Eleventy (11ty).

### Development

**Start development server**:
```bash
npm run dev
```
  This runs the development server for Eleventy and watches for changes using Webpack.

### Building

**Build the static site**:
```bash
npm run build
```
  This script cleans the `dist` directory and runs the Eleventy and Webpack build processes.

## Design system frontend code

The design system frontend code is designed to be published to npm for consumption in other applications. Components are written in Nunjucks.

### Figma Tokens

**Environment Variables**:

   Create a `.env` file in the root of your project and add your Figma access token and file ID:

```bash
ACCESS_TOKEN=your_figma_access_token
FILE_ID=your_figma_file_id
```

**Fetch Figma design tokens**:
```bash
npm run figma:token-fetch
```
  This script fetches design tokens from Figma and generates SCSS files.

### Publishing to npm

**Publish the codebase to npm**:
```bash
npm run npm:package
```
  This script cleans the `dist` directory, builds the Webpack bundles, copies components and SCSS files, and prepares the package for publishing.
### Linting

**Lint JavaScript files**:
```bash
npm run lint:js
```
**Lint SCSS files**:
```bash
npm run lint:scss
```

## License

This project is licensed under the MIT License.