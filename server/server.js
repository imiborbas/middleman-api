var express = require('express');
var bodyParser = require('body-parser');

var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose')
var {Wallet} = require('./db/models/wallet')
var {User} = require('./db/models/user')
var {Developer} = require('./db/models/developer')

var app = express();

app.use(bodyParser.json());

// Create a New Wallet
app.post('/wallets', (req, res) => {
  var wallet = new Wallet({
    address: req.body.address
  });
  wallet.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  })
});

// Get an existing Wallet
app.get('/wallets/:id', (req, res) => {
  // is it a valid id
  var id = req.params.id;
  if (!ObjectID.isValid(id)) { return res.status(404).send() }

  Wallet.findById(id).then((wallet) => {
    // was a wallet found
    if (!wallet) { return res.status(404).send() }

    res.send({wallet});
  }, (err) => {
    res.stats(400).send();
  })
});

// Check Wallet Balance
app.get('/wallets/:id/balance', (req, res) => {
  // use The Graph or Cleargraph to fetch the wallet balance and return it

}, (err) => {
  res.status(400).send();
})

// Sign a transaction/message
// req.body must include data to sign
app.post('/wallets/:id/sign', (req, res) => {
  // sign whatever is in req.body.data with the key in Wallet.findById(id).private_key
}, (err) => {
  res.status(400).send();
})

// Transfer $ from wallet to somewhere else
// req.body must include two addr and amount and token type
app.post('/wallets/:id/transfer', (req, res) = {
  // check if the user has that amount in balance
  // check if it is a valid address
  // transfer amount (req.body.amount) of token_type (req.body.token) to address (req.body.to_addr)
  
}, (err) => {
  res.status(400).send();
})

app.listen(3000, () => {
  console.log('Started listening on port 3000');
});
