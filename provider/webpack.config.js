const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './src/provider.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'provider.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [new HtmlWebpackPlugin(
    {
      template: 'public/provider.html',
      hash: true
    }
  ),
  new CopyPlugin({
    patterns: [
      {
        from: 'public/*.json', to({ context, absoluteFilename }) {
          return Promise.resolve("[name][ext]");
        }
      },
      {
        from: 'public/*.ico', to({ context, absoluteFilename }) {
          return Promise.resolve("[name][ext]");
        }
      },
    ],
  })],
};
