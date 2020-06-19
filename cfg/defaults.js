'use strict';
const path = require('path');
const autoprefixer = require('autoprefixer');
const srcPath = path.join(__dirname, '/../src');
const vendorPath = path.join(__dirname, '/../vendor');
const dfltPort = 8000;
function getDefaultModules() {
  return {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: srcPath,
        loader: 'eslint-loader!babel-loader'
      },
      {
        test: /\.(js|jsx)$/,
        include: path.join(__dirname, 'node_modules'),
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.s(c|a)ss$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: 'expanded'
              }
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|woff|woff2)$/,
        loader: 'url-loader?limit=8192'
      },
      {
        test: /\.(mp4|ogg|svg)$/,
        loader: 'file-loader'
      }
    ]
  };
}
module.exports = {
  srcPath: srcPath,
  vendorPath: vendorPath,
  publicPath: '/assets/',
  port: dfltPort,
  getDefaultModules: getDefaultModules,
  postcss: function () {
    return [ autoprefixer({ browsers: ['last 5 versions', 'ie 6-11']  }) ];
  }
};
