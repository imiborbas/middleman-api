const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
  authTokens: [{
    access: {
      type: String,
      required: true
    },
    authToken: {
      type: String,
      required: true
    }
  }]
});

DeveloperSchema.methods.generateAuthToken = function() {
  var developer = this;
  var access = 'auth';
  var authToken = jwt.sign({_id: developer._id.toHexString(), access}, 'secret').toString();

  developer.authTokens = developer.authTokens.concat([{access, authToken}]);
  return developer.save().then(() => {
    return authToken;
  }, (err) => {
    console.log(err);
    return (err);
  });
}; //arrow functions do not bind a this keyword, and we need one here

// statics = model method not instance method
// model method so this capital D developer
DeveloperSchema.statics.findByAuthToken = function(authToken) {
  var Developer = this;
  var decoded;

  try {
    decoded = jwt.verify(authToken, 'secret');
  } catch (err) {
    return Promise.reject();
  }

  return Developer.findOne({
    _id: decoded._id,
    'authTokens.authToken': authToken,
    'authTokens.access': 'auth'
  })
}

DeveloperSchema.statics.findByCredentials = function(email, password) {
  var Developer = this;

  return Developer.findOne({email}).then((developer) => {
    if (!developer) { return Promise.reject('no account with that email'); }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, developer.password, (err, res) => {
        if (res) { resolve(developer); }
        else { reject('wrong password'); }
      });
    });
  });
}

DeveloperSchema.methods.toJSON = function() {
  var developer = this;
  var developerObj = developer.toObject();

  var authTokenArray = _.get(developerObj, 'authTokens');

  var result = {
    account: _.pick(developerObj, ['_id', 'email']),
    authToken: authTokenArray[0].authToken
  }

  return result;
};

DeveloperSchema.pre('save', function(next) {
  var developer = this;

  if (developer.isModified('password')) {
    // gen salt and hash
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(developer.password, salt, (err, hash) => {
        developer.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// Developer Model
var Developer = mongoose.model('Developer', DeveloperSchema);

module.exports = {Developer}
