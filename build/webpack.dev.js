const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const { plugin } = require("typescript-eslint");

module.exports = merge(commonConfig, {
  mode: "development",
  devServer: {
    port: 3000,
    hot: true,
  },
  plugins: [new ReactRefreshWebpackPlugin()],
});
