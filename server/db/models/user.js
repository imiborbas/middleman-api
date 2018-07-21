var mongoose = require('mongoose');

// User Model
var User = mongoose.model('User', {
  user_id: {
    type: String, // maps to the developer-sent id
    required: true,
    trim: true
  },
  // developer: {
  //   type: new ObjectId
  // },
  // wallet: {
  //   type: new ObjectId
  // }
});

module.exports = {User};
