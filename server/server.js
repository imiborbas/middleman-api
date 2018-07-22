const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose')
const {Wallet} = require('./db/models/wallet');
const {User} = require('./db/models/user');
const {Developer} = require('./db/models/developer');

const {createWallet} = require('./create-wallet');
const {getWalletById} = require('./get-wallet-by-id');
const {signMessage} = require('./wallet-api-functions');
const {signTransaction} = require('./wallet-api-functions');
const {getWalletBalance} = require('./get-balance');
const {authenticate} = require('./middleware/authenticate');

const app = express();

app.use(bodyParser.json());

// Create a New Wallet
app.get('/wallets', (req, res) => {
  createWallet().then((wallet) => {
    res.send({
      address: wallet.address,
      id: wallet._id
    });
  }, (err) => {
    res.status(400).send(err);
  })
});

// Get an existing Wallet
app.get('/wallets/:id', (req, res) => {
  getWalletById(req.params.id).then((wallet) => {
    res.send({"address": wallet.address});
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
  getWalletBalance(req.params.id).then((balance) => {
    res.send({"balance": balance});
  }, (err) => {
    res.status(400).send();
  })
  }, (err) => {
  res.status(400).send();
})

// Sign a transaction
// req.body must include transaction to sign
app.post('/wallets/:id/sign_transaction', (req, res) => {
    signTransaction(req.params.id, req.body.transaction).then((signedTransaction) => {
      res.send({signedTransaction});
    }, (err) => {
      console.log(err);
      res.status(400).send();
    })
  }, (err) => {
    console.log(err);
    res.status(400).send();
})

// Sign a message
// req.body must include message to sign
app.post('/wallets/:id/sign_message', (req, res) => {
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

// Sign up
app.post('/signup', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var developer = new Developer(body);

  developer.save().then(() => {
    return developer.generateAuthToken().then((authToken) => {
      res.header('x-auth-key', authToken).send({developer})
    }, (err) => {
      console.log(err);
    });
  }, (err) => {
    res.status(400).send();
    console.log(err);
  })
}, (err) => {
  res.status(400).send();
  console.log(err);
})

// Login
app.post('/login', (req, res) => {
  // find a dev with the email and hashed pw that = plain text pw
  var body = _.pick(req.body, ['email', 'password']);

  Developer.findByCredentials(body.email, body.password).then((developer) => {
    // generate a new token and send it back
    return developer.generateAuthToken().then((authToken) => {
      res.header('x-auth-key', authToken).send({developer});
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
});

app.get('/developers/me', authenticate, (req, res) => {
  res.send(req.developer);
});

app.listen(3000, () => {
  console.log('Started listening on port 3000');
});
