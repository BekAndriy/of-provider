const path = require('path');

module.exports = {
  extends: path.resolve(__dirname, './webpack.dev.config.js'),
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
    hot: true,
  }
};
