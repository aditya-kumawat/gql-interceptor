const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

let pathsToClean = { cleanOnceBeforeBuildPatterns: ["build/content"] };

module.exports = {
  context: path.join(__dirname, "src"),
  entry: {
    background: "./content/background.ts",
    contentScript: "./content/contentScript.ts",
    inject: "./content/inject.ts",
  },
  output: {
    path: path.join(__dirname, "build", "content"),
    filename: "[name].js",
    crossOriginLoading: "anonymous"
  },
  mode: "production",
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{ loader: "ts-loader", options: { transpileOnly: true } }],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(pathsToClean),
  ]
};
