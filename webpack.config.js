const webpack = require('webpack');

const isProduction = process.env.NODE_ENV === 'production' && false;

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

  devtool: 'source-map',

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
      use: [{
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
      }],
    }, {
      test: /.css$/,
      use: ['style-loader', 'css-loader']
    }]
  },

  plugins: [].concat(
    isProduction
      ? [
        new webpack.optimize.UglifyJsPlugin()
      ]
      : [
        new webpack.HotModuleReplacementPlugin()
      ]
  )

};

