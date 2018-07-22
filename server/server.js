const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const hbs = require('hbs');

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

app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/../views/partials');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// Handlebars helpers (name of helper, func to run)

hbs.registerHelper('getCurrentYear', () => {
  return new Date().getFullYear();
});

hbs.registerHelper('toUpperCase', (text) => {
  return text.toUpperCase();
})

// Views

app.get('/', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Home Page',
    welcomeMessage: 'welcome!'
  })
})

app.get('/about', (req, res) => {
  res.render('about.hbs', {
    pageTitle: 'About Page'
  });
})

// API

// Create a New Wallet
app.post('/wallets', authenticate, (req, res) => {
  createWallet(req.body.user_id, req.developer._id).then((wallet) => {
    res.send({
      address: wallet.address,
      id: wallet._id
    });
  }, (err) => {
    res.status(400).send(err);
  })
});

// Get an existing Wallet
app.get('/wallets/:id', authenticate, (req, res) => {
  getWalletById(req.params.id, req.developer._id).then((wallet) => {
    console.log('Wallet is: ', wallet);
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
app.get('/wallets/:id/balance', authenticate, (req, res) => {
  getWalletBalance(req.params.id, req.developer._id).then((balance) => {
    res.send({"balance": balance});
  }, (err) => {
    res.status(400).send();
  })
  }, (err) => {
  res.status(400).send();
})

// Sign a transaction
// req.body must include transaction to sign
app.post('/wallets/:id/sign_transaction', authenticate, (req, res) => {
    signTransaction(req.params.id, req.developer._id, req.body.transaction).then((signedTransaction) => {
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
app.post('/wallets/:id/sign_message', authenticate, (req, res) => {
  signMessage(req.params.id, req.developer._id, req.body.message).then((message) => {
    res.send({message});
  }, (err) => {
    res.status(400).send();
  })
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
