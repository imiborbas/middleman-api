var {mongoose} = require('./db/mongoose')
var {ObjectID} = require('mongodb');
var {Wallet} = require('./db/models/wallet')

var getWalletById = (walletId, developerId) => {
  return new Promise((resolve, reject) => {
    // is it a valid id?
    if (!ObjectID.isValid(walletId)) { reject('400') }

    // find the wallet by id and make sure it belongs to the developer
    Wallet.find({
      _id: walletId,
      _developer: developerId
    }).then((wallet) => {
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
