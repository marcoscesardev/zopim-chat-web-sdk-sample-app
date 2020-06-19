/*eslint no-console:0 */
'use strict';
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const open = require('open');
const ip_address = '127.0.0.1';

new WebpackDevServer(webpack(config), config.devServer)
.listen(8000, ip_address, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`Listening at ${ip_address}:8000`);
  console.log('Opening your system browser...');
  open(`http://${ip_address}:8000/webpack-dev-server/`);
});
