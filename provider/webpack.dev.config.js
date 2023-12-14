const path = require('path');

module.exports = {
  extends: path.resolve(__dirname, './webpack.config.js'),
  devtool: 'inline-source-map',
  mode: 'development',
};
