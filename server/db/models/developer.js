const mongoose = require('mongoose');
const validator = require('validator');

// Developer Model
var Developer = mongoose.model('Developer', {
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  api_keys: [{
    access: {
      type: String,
      required: true
    },
    api_key: {
      type: String,
      required: true
    }
  }]
});

module.exports = {Developer}
