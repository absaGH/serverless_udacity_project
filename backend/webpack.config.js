const path = require('path');
const slsw = require('serverless-webpack');
// var nodeExternals = require('webpack-node-externals')

module.exports = {
  //slsw.lib.webpack.isLocal ? 'development' : 'production',
  mode: 'development', 
  entry: slsw.lib.entries,
  // externals: [nodeExternals()],
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },
};
