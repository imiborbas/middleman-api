var express = require('express');
var bodyParser = require('body-parser');

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
})

app.listen(3000, () => {
  console.log('Started listening on port 3000');
});
