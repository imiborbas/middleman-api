var express = require('express');
var bodyParser = require('body-parser');

var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose')
var {Wallet} = require('./db/models/wallet')
var {User} = require('./db/models/user')
var {Developer} = require('./db/models/developer')

var {createWallet} = require('./create-wallet')
var {getWalletById} = require('./get-wallet-by-id')
var {signMessage} = require('./wallet-api-functions')

var app = express();

app.use(bodyParser.json());

// Create a New Wallet
app.get('/wallets', (req, res) => {
  createWallet().then((wallet) => {
    res.send({
      address: wallet.address
    });
  }, (err) => {
    res.status(400).send(err);
  })
});

// Get an existing Wallet
app.get('/wallets/:id', (req, res) => {
  getWalletById(req.params.id).then((wallet) => {
    res.send({wallet});
  }, (err) => {
    if (err = '404') {
      return res.status(404).send();
    } else {
      res.status(400).send();
    }
  });
});

// Check Wallet Balance
app.get('/wallets/:id/balance', (req, res) => {
  // use The Graph or Cleargraph to fetch the wallet balance and return it

}, (err) => {
  res.status(400).send();
})

// Sign a transaction
// req.body must include transaction to sign
app.post('/wallets/:id/sign_transaction', (req, res) => {
  // sign whatever is in req.body.transaction with the key in Wallet.findById(id).private_key
}, (err) => {
  res.status(400).send();
})

// Sign a transaction
// req.body must include message to sign
app.post('/wallets/:id/sign_message', (req, res) => {
  // sign whatever is in req.body.message with the key in Wallet.findById(id).private_key
  signMessage(req.params.id, req.body.message).then((message) => {
    res.send({message});
  }, (err) => {
    res.status(400).send();
  })
}, (err) => {
  res.status(400).send();
})

// Transfer $ from wallet to somewhere else
// req.body must include two addr and amount and token type
app.post('/wallets/:id/transfer', (req, res) => {
  // check if the user has that amount in balance
  // check if it is a valid address
  // transfer amount (req.body.amount) of token_type (req.body.token) to address (req.body.to_addr)

}, (err) => {
  res.status(400).send();
})

app.listen(3000, () => {
  console.log('Started listening on port 3000');
});
