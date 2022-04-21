// Generated using webpack-cli https://github.com/webpack/webpack-cli
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: {
    client: "./src/client.index.tsx",
  },
  devtool: false,
  output: {
    filename: "[name].js.html",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [new HtmlWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "babel-loader",
        exclude: ["/node_modules/"],
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
        },
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", { loader: "css-loader", options: { url: false } }],
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};

module.exports = () => {
  if (isProduction) config.mode = "production";
  else config.mode = "development";
  return config;
};
