var Web3 = require('./web3/web3/src/index.js');
var web3 = new Web3();

var Random = require('random-js');

var {Wallet} = require('./db/models/wallet')
var {mongoose} = require('./db/mongoose')
var _ = require('lodash');

var createEntropy= () => {
  var engine = Random.engines.mt19937().autoSeed();
  var distribution = Random.integer(-9007199254740992, 9007199254740992);
  var randomNumber = distribution(engine);
}

var createWallet = (userId, developerId) => {
  return new Promise((resolve, reject) => {
    var walletObj = web3.eth.accounts.create(createEntropy());
    var wallet = new Wallet({
      address: walletObj.address,
      private_key: walletObj.privateKey,
      user_id: userId,
      _developer: developerId
    });
    wallet.save().then((wallet) => {
      resolve(wallet);
    }, (err) => {
      console.log(err);
      reject(err);
    });
  });
}

module.exports = {createWallet};
