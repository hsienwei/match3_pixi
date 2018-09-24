// webpack.config.js
var path = require('path')

module.exports = {
  entry: ['./demo' ], // .js after index is optional
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}