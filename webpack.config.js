module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: __dirname
  },
  devtool: 'source-map',
  module: {
    rules: [
    {
      test: /\.(js|mjs)$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }
  ]
  },
  watchOptions: {
    ignored: [/node_modules/],
  }
};
