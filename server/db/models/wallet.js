var mongoose = require('mongoose');
var CryptoJS = require("crypto-js");

// Wallet Model
var WalletSchema = new mongoose.Schema({
  user_id: { // dev sets the user id
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  private_key: {
    type: String,
    required: false
  },
  public_key: {
    type: String,
    required: false
  },
  _developer: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  } // this maps to the autogenerated ID in the User collection
})

WalletSchema.methods.toJSON = function() {
  var wallet = this;
  var walletObj = wallet.toObject();

  return _.pick(walletObj, ['address', '_id', 'user_id']);
};

// before saving private key, encrypt it
WalletSchema.pre('save', function(next) {
  var wallet = this;

  if (wallet.isModified('private_key')) {
    // Encrypt
    var ciphertext = CryptoJS.AES.encrypt(wallet.private_key, process.env.ENCRYPTION_KEY);
    wallet.private_key = ciphertext;
    next();
  } else {
    next();
  }
});

WalletSchema.statics.getPrivateKey = function(private_key) {
  var Wallet = this;

  return Wallet.findOne({private_key}).then((wallet) => {

    if (!wallet) { return Promise.reject('no wallet with that key'); }

    return new Promise((resolve, reject) => {
      // Decrypt
      var bytes  = CryptoJS.AES.decrypt(wallet.private_key.toString(), process.env.ENCRYPTION_KEY);
      var plaintext = bytes.toString(CryptoJS.enc.Utf8);
      resolve(plaintext);
    });
  });
}

var Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = {Wallet};
