const path = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common');
const CopyWebpackPlugin = require('copy-webpack-plugin');

require('dotenv').config({ path: './.env.prod' });

module.exports = merge(commonConfig, {
  mode: 'production',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'),
          to: path.resolve(__dirname, '../dist'),
          filter: (source) => {
            return !source.includes('index.html');
          },
        },
      ],
    }),
  ],
});
