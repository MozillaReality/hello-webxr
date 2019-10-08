module.exports = {
  entry: './src/index.mjs',
  output: {
    filename: 'bundle.js',
    path: __dirname
  },
  devtool: 'source-map',
  module: {
    rules: [
    {
      test: /\.mjs$/,
      type: 'javascript/auto',
    }]
  }
};
