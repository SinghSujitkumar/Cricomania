const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://mongodb/Csi');

module.exports = {
  mongoose
};
