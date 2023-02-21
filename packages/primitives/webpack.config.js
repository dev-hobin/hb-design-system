const path = require("path");
require("../../babel.config.json");

module.exports = {
  mode: "development",
  entry: {
    index: { import: "./src/index.ts" },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "primitives.bundle.js",
  },

  resolve: {
    extensions: [".ts", ".tsx"],
  },
};
