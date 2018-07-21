var {mongoose} = require('./db/mongoose')
var {ObjectID} = require('mongodb');
var {Wallet} = require('./db/models/wallet')

var getWalletById = (req) => {
  return new Promise((resolve, reject) => {
    // is it a valid id?
    var id = req.params.id;
    if (!ObjectID.isValid(id)) { reject('400') }

    // find the wallet by id
    Wallet.findById(id).then((wallet) => {
      // was a wallet actually found
      if (!wallet) { reject('404') }

      // otherwise return the wallet
      resolve(wallet);
    }, (err) => {
      reject(err);
    })
  })
};

module.exports = {getWalletById};
