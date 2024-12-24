const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

require('dotenv').config();

const isDEV = process.env.NODE_ENV === 'development';

module.exports = {
  mode: process.env.NODE_ENV,
  entry: path.join(__dirname, './src/index.tsx'), // 入口文件
  output: {
    path: path.join(__dirname, './dist'), // 出口文件
    clean: true,
    publicPath: '/',
    filename: 'index.js',
  },
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  module: {
    rules: [
      // 配置babel-loader识别ts和tsx
      {
        test: /\.(ts|tsx)$/i, // 匹配ts和tsx 文件
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        test: /\.(less)$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    // import 的时候省略后缀
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, './src'), // 将 '@' 映射到 'src' 目录
    },
  },
  plugins: [
    isDEV ? new ReactRefreshWebpackPlugin() : null,
    // 把最终构建好的静态资源都引入到HTML文件中
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html'),
      // 自动注入静态资源
      inject: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './public'),
          to: path.resolve(__dirname, './dist'),
          filter: (source) => {
            return !source.includes('index.html');
          },
        },
      ],
    }),
  ].filter(Boolean),
};
