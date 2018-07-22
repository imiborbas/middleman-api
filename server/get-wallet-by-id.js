var {mongoose} = require('./db/mongoose')
var {ObjectID} = require('mongodb');
var {Wallet} = require('./db/models/wallet')

var getWalletById = (walletId, developerId) => {
  return new Promise((resolve, reject) => {
    // is it a valid id?
    if (!ObjectID.isValid(walletId)) { reject('400') }

    // find the wallet by id and make sure it belongs to the developer
    Wallet.findOne({
      _id: walletId,
      _developer: developerId
    }).then((wallet) => {
      // was a wallet actually found
      if (!wallet) { reject('404') }

      // otherwise return the wallet
      console.log('in getWalletById, wallet is: ', wallet);
      console.log(typeof wallet);
      resolve(wallet);
    }, (err) => {
      reject(err);
    })
  })
};

var getWalletByDeveloper = (developerId) => {
  return new Promise((resolve, reject) => {
    // is it a valid id?
    if (!ObjectID.isValid(developerId)) { console.log('not a valid id'); reject('400') }

    Wallet.find({ _developer: developerId }).then((wallets) => {
      console.log('wallets: ', wallets);
      if (!wallets) { reject('404') }
      resolve(wallets);
    })
  })
}

module.exports = {getWalletById};
module.exports = {getWalletByDeveloper};
