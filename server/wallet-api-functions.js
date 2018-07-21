var {mongoose} = require('./db/mongoose')
var {ObjectID} = require('mongodb');
var {Wallet} = require('./db/models/wallet')
var {getWalletById} = require('./get-wallet-by-id')

var Web3 = require('web3');
var web3 = new Web3();

var createAccountFromKey = (id) => {
  return new Promise((resolve, reject) => {

    // get the wallet id from req
    getWalletById(id).then((wallet) => {

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

var signMessage = (id, message) => {
  return new Promise((resolve, reject) => {

    // get the wallet id and ctreate an account (call createAccountFromKey for all of this)
    createAccountFromKey(id).then((account) => {

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

var transferTokens = (req) => {
  return new Promise((resolve, reject) => {

    // createAccountFromKey

    // use web3 to transfer transfer tokens
    // may have to set up an http provider/infura for this

  }, (err) => {
    reject(err);
  })
}

module.exports = {signMessage}
