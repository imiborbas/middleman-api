var {mongoose} = require('./db/mongoose')
var {ObjectID} = require('mongodb');
var {Wallet} = require('./db/models/wallet')
var {getWalletById} = require('./get-wallet-by-id')

var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('https://mainnet.infura.io/v3/9425cb4913f540db83c938c05d31dbb4'));

var createAccountFromKey = (walletId, developerId) => {
  return new Promise((resolve, reject) => {

    // get the wallet id from req
    getWalletById(walletId, developerId).then((wallet) => {

      // use web3 to create an account from the private key
      var account = web3.eth.accounts.privateKeyToAccount(wallet.private_key)

      // return the account
      console.log(account);
      resolve(account);

    }, (err) => {
      reject(err);
    });

  }, (err) => {
    reject(err);
  })
}

var signMessage = (walletId, developerId, message) => {
  return new Promise((resolve, reject) => {

    // get the wallet id and ctreate an account (call createAccountFromKey for all of this)
    createAccountFromKey(walletId, developerId).then((account) => {

      // use the web3 sign function to sign something
      var signedMessage = account.sign(message, account.privateKey);

      // return signed string
      resolve(signedMessage);

    }, (err) => {
      reject(err);
    })

  }, (err) => {
    reject(err);
  })
}

var signTransaction = (walletId, developerId, transaction) => {
  return new Promise((resolve, reject) => {
    // get the wallet id and create a temp account
    createAccountFromKey(walletId, developerId).then((account) => {

      // use the web3 sign function to sign something
      var signedTransaction = account.signTransaction(transaction, account.privateKey);

      // return signed string
      resolve(signedTransaction);

    }, (err) => {
      reject(err);
    })
  }, (err) => {
    reject(err);
  })
}

module.exports = {
  signMessage,
  signTransaction
};
