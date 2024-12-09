const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
require("dotenv").config();

module.exports = {
  entry: path.join(__dirname, "../src/index.tsx"), // 入口文件
  output: {
    path: path.join(__dirname, "../dist"), // 出口文件
    clean: true,
    publicPath: "/",
    filename: "index.js",
  },
  module: {
    rules: [
      // 配置babel-loader识别ts和tsx
      {
        test: /.(ts|tsx)$/, // 匹配ts和tsx 文件
        use: "babel-loader",
      },
      {
        test: /\.(css|less)$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
  resolve: {
    // import 的时候省略后缀
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  plugins: [
    // 把最终构建好的静态资源都引入到HTML文件中
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
      // 自动注入静态资源
      inject: true,
    }),
    new webpack.DefinePlugin({
      "process.env.S3_BUCKET": JSON.stringify(process.env.S3_BUCKET),
    }),
  ],
};
