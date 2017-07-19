var mongoose = require('mongoose');
// set Promise provider to bluebird
mongoose.Promise = require('bluebird');
module.exports = {
  mongoose: mongoose,
  connection: mongoose.connect(local.db_url)
};