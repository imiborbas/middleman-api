var {mongoose} = require('./db/mongoose')
var {ObjectID} = require('mongodb');
var {Wallet} = require('./db/models/wallet')

var getWalletById = (walletId, developerId) => {
  return new Promise((resolve, reject) => {
    // is it a valid id?
    if (!ObjectID.isValid(walletId)) { console.log('not a valid wallet id'); reject('400') }

    // find the wallet by id and make sure it belongs to the developer
    Wallet.findOne({
      _id: walletId,
      _developer: developerId
    }).then((wallet) => {
      // was a wallet actually found
      if (!wallet) { console.log('no wallet with that id'); reject('404') }

      // otherwise return the wallet
      resolve(wallet);
    }, (err) => {
      console.log('[getWalletById] err: ', err);
      reject(err);
    })
  })
};

var getWalletByDeveloper = (developerId) => {
  return new Promise((resolve, reject) => {
    // is it a valid id?
    if (!ObjectID.isValid(developerId)) { console.log('not a valid id'); reject('400') }

    Wallet.find({ _developer: developerId }).then((wallets) => {
      if (!wallets) { reject('404') }
      resolve(wallets);
    })
  })
}

var getWalletIdByAddr = (walletAddr, developerId) => {
  return new Promise((resolve, reject) => {

    // find the wallet by id and make sure it belongs to the developer
    Wallet.findOne({
      address: walletAddr,
      _developer: developerId
    }).then((wallet) => {
      // was a wallet actually found
      if (!wallet) { console.log('no wallet with that address'); reject('404') }

      // otherwise return the wallet id
      resolve(wallet._id);
    }, (err) => {
      console.log('[getWalletById] err: ', err);
      reject(err);
    })
  })
};

var getWalletByAddr = (walletAddr, developerId) => {
  return new Promise((resolve, reject) => {

    // find the wallet by id and make sure it belongs to the developer
    Wallet.findOne({
      address: walletAddr,
      _developer: developerId
    }).then((wallet) => {
      // was a wallet actually found
      if (!wallet) { console.log('no wallet with that address'); reject('404') }

      // otherwise return the wallet id
      resolve(wallet);
    }, (err) => {
      console.log('[getWalletById] err: ', err);
      reject(err);
    })
  })
};

var getWalletsByUserId = (userId, developerId) => {
  return new Promise((resolve, reject) => {
    // find all wallets for that user
    Wallet.find({
      user_id: userId,
      _developer: developerId
    }).then((wallets) => {
      // was any wallet actually found?
      if (!wallets) { console.log('no wallets have been created for that user'); reject('404') }
      resolve(wallets);
    }, (err) => {
      reject(err);
    })
  })
}

module.exports = {
  getWalletById,
  getWalletByDeveloper,
  getWalletIdByAddr,
  getWalletByAddr,
  getWalletsByUserId
};
