var {mongoose} = require('./db/mongoose')
var {ObjectID} = require('mongodb');
var {Wallet} = require('./db/models/wallet')
var {getWalletById} = require('./get-wallet-by-id')
var {getWalletIdByAddr} = require('./get-wallet-by-id')
var _ = require('lodash');

var Web3 = require('./web3/web3/src/index.js');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('https://mainnet.infura.io/v3/9425cb4913f540db83c938c05d31dbb4'));

var createAccountFromKey = (walletId, developerId) => {
  return new Promise((resolve, reject) => {

    // get the wallet id from req
    getWalletById(walletId, developerId).then((wallet) => {
      // use web3 to create an account from the private key
      Wallet.getPrivateKey(wallet.private_key).then((privateKey) => {
        var account = web3.eth.accounts.privateKeyToAccount(privateKey);

        // return the account
        resolve(account);
      })

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

var signMessageByAddr = (walletAddr, developerId, message) => {
  return new Promise((resolve, reject) => {

    getWalletIdByAddr(walletAddr, developerId).then((walletId) => {
      // get the wallet id and ctreate an account (call createAccountFromKey for all of this)
      createAccountFromKey(walletId, developerId).then((account) => {
        // use the web3 sign function to sign something
        var signedMessage = account.sign(message, account.privateKey);

        // return signed string
        resolve(signedMessage);

      }, (err) => {
        reject(err);
      })

    });
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
      resolve(result);

    }).catch((err) => { reject(err); })
  }).catch((err) => { reject(err); })
}

let arbitraryCallbackFn = (err, result) => {
  console.log(result)
}

var signTransactionByAddr = (walletAddr, developerId, transaction) => {
  return new Promise((resolve, reject) => {
    getWalletIdByAddr(walletAddr, developerId).then((walletId) => {
    // get the wallet id and create a temp account
    createAccountFromKey(walletId, developerId).then((account) => {

      var signedTransaction = account.signTransaction(transaction, account.privateKey);
      resolve(signedTransaction);

    }).catch((err) => { reject(err); })
    }).catch((err) => { reject(err); })
  })
}

var recoverTransactionById = (rawTxn, walletId, developerId) => {
  return new Promise((resolve, reject) => {
    resolve(web3.eth.accounts.recoverTransaction(rawTxn));
  }).catch((e) => {
    reject(e);
  })
}

var recoverTransactionByAddr = (rawTxn, walletAddr, developerId) => {
  return new Promise((resolve, reject) => {
    resolve(web3.eth.accounts.recoverTransaction(rawTxn));
  }).catch((e) => {
    reject(e);
  })
}

var hashMessage = (message) => {
  return new Promise((resolve, reject) => {
    resolve(web3.eth.accounts.hashMessage(message));
  }).catch((e) => {
    console.log(e);
    reject(e);
  })
}


module.exports = {
  signMessage,
  signMessageByAddr,
  signTransaction,
  signTransactionByAddr,
  recoverTransactionById,
  recoverTransactionByAddr,
  hashMessage
};
