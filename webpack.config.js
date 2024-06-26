const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const sass = require("sass");

module.exports = {
  entry: {
    main: ["./src/js/main.js", "./src/scss/main.scss"],
  },
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
            presets: ["@babel/preset-env"],
            sourceMaps: true,
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
  ],
  stats: {
    errorDetails: true,
  },
};
