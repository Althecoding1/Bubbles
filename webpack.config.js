module.exports = {
  entry: './src/client.jsx',
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [ {loader: "style-loader"} , {loader: "css-loader"}, {loader: "sass-loader"}]
      }
    ]
  },
  resolve: {
    extensions: [ '.js', '.json', '.jsx' ]
  }
};
