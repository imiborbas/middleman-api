var express = require('express');
var bodyParser = require('body-parser');

var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose')
var {Wallet} = require('./db/models/wallet')
var {User} = require('./db/models/user')
var {Developer} = require('./db/models/developer')

var app = express();

app.use(bodyParser.json());

app.post('/wallets', (req, res) => {
  console.log(req.body);
  var wallet = new Wallet({
    address: req.body.address
  });
  wallet.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  })
});

app.get('/wallets', (req, res) => {
  Wallet.find().then((wallets) => {
    res.send({
      wallets,
      code: 'success'
    });
  }, (err) => {
    res.stats(400).send(err);
  })
});

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

app.listen(3000, () => {
  console.log('Started listening on port 3000');
});
