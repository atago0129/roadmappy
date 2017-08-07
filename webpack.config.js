const webpack = require('webpack');

module.exports = {

  entry: {
    roadmappy: __dirname + '/src/index.js',
  },

  output: {
    path: __dirname + '/dist',
    filename: '[name].min.js',
    library: 'Roadmappy',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },

  devtool: 'sourcemap',

  devServer: {
    contentBase: 'debug/',
    publicPath: '/dist/',
    port: 9999,
    inline: true
  },

  node: {
    fs: 'empty'
  },

  module: {
    rules: [{
      test: /.js$/,
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        presets: [
          ['env', {
            modules: false,
            loose: true,
            targets: {
              browsers: 'last 2 versions'
            }
          }]
        ],
        plugins: [
          'babel-plugin-transform-class-properties'
        ]
      }
    }]
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]

};

