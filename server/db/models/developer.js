var mongoose = require('mongoose');

// Developer Model
var Developer = mongoose.model('Developer', {
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  pass_hash: {
    type: String,
    required: true,
    trim: true
  },
  api_key: {
    type: String,
    required: true,
    trim: true
  }
});

module.exports = {Developer}
