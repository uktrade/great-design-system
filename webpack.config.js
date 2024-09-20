const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const sass = require("sass");
const webpack = require("webpack");

const isPackageBuild = process.env.PACKAGE_BUILD === "true";

const entries = {
  main: "./src/js/main.js",
  main_css: "./src/scss/main.scss",
};

if (!isPackageBuild) {
  entries.app_css = "./src/_includes/scss/app.scss";
}

module.exports = {
  entry: entries,
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].js",
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              url: false,
            },
          },
          {
            loader: "resolve-url-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              implementation: sass,
              sourceMap: true,
              sassOptions: {
                outputStyle: "compressed",
                includePaths: ["node_modules"],
              },
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
            sourceMaps: true,
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: (pathData) => {
        if (pathData.chunk.name === "main_css") {
          return "css/main.css";
        }
        if (pathData.chunk.name === "app_css") {
          return "css/app.css";
        }
        return "css/[name].css";
      },
    }),
    new webpack.DefinePlugin({
      "process.env.PACKAGE_BUILD": JSON.stringify(process.env.PACKAGE_BUILD),
    }),
  ],
  stats: {
    errorDetails: true,
  },
};
