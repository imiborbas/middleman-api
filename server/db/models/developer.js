const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var DeveloperSchema = new mongoose.Schema({
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

DeveloperSchema.methods.generateAPIKey = function() {
  var developer = this;
  var access = 'auth';
  var api_key = jwt.sign({_id: developer._id.toHexString(), access}, 'secret').toString();

  developer.api_keys = developer.api_keys.concat([{access, api_key}]);
  return developer.save().then(() => {
    return api_key;
  }, (err) => {
    console.log(err);
    return (err);
  });
}; //arrow functions do not bind a this keyword, and we need one here

DeveloperSchema.methods.toJSON = function() {
  var developer = this;
  var developerObj = developer.toObject();

  var apiKeyArray = _.get(developerObj, 'api_keys');

  var result = {
    account: _.pick(developerObj, ['_id', 'email']),
    api_key: apiKeyArray[0].api_key
  }

  return result;
};

// Developer Model
var Developer = mongoose.model('Developer', DeveloperSchema);

module.exports = {Developer}
