const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const hbs = require('hbs');
const session = require('express-session');
const Auth0Strategy = require('passport-auth0');
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');
const {Wallet} = require('./db/models/wallet');
const {User} = require('./db/models/user');
const {Developer} = require('./db/models/developer');

const {createWallet} = require('./create-wallet');
const {getWalletById} = require('./get-wallet-by-id');
const {getWalletIdByAddr} = require('./get-wallet-by-id');
const {getWalletByAddr} = require('./get-wallet-by-id');
const {getWalletByDeveloper} = require('./get-wallet-by-id');
const {getWalletsByUserId} = require('./get-wallet-by-id');
const {signMessage} = require('./wallet-api-functions');
const {signMessageByAddr} = require('./wallet-api-functions');
const {signTransaction} = require('./wallet-api-functions');
const {signTransactionByAddr} = require('./wallet-api-functions');
const {recoverTransactionById} = require('./wallet-api-functions');
const {recoverTransactionByAddr} = require('./wallet-api-functions');
const {hashMessage} = require('./wallet-api-functions');
const {getWalletBalance} = require('./get-balance');
const {authenticate} = require('./middleware/authenticate');

const app = express();

app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/../views/partials');
app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.json());
app.use(express.urlencoded());

// Handlebars helpers (name of helper, func to run)

hbs.registerHelper('getCurrentYear', () => {
  return new Date().getFullYear();
});

// Session management

const sess = {
  secret: 'd3b07384d113edec49eaa6238ad5ff00',
  cookie: {},
  resave: false,
  saveUninitialized: true
};

if (app.get('env') === 'production') {
  sess.cookie.secure = true; // serve secure cookies, requires https
}

app.use(session(sess));

// Auth0 setup

const authStrategy = new Auth0Strategy({
    domain: 'middleman-api.auth0.com',
    clientID: '40zyricRw8Eq8RMna13Sn4737OVnQhoh',
    clientSecret: 'Ci1eAHZaqLP10YeiEl0gNyVWI2IXzp2gfhw8PpZ0mgcO8xXK5GYxWN2nyIHXnfc4',
    callbackURL: 'http://localhost:3000/callback'
  },
  (accessToken, refreshToken, extraParams, profile, done) => {
    return done(null, profile);
  }
);

passport.use(authStrategy);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// User-related actions

app.get('/login', passport.authenticate('auth0', { scope: 'openid email profile' }), (req, res) => {
  res.redirect('/');
});

app.get('/callback', passport.authenticate('auth0', { failureRedirect: '/login' }), (req, res) => {
  if (!req.user) {
    throw new Error('user null');
  }
  res.redirect('/account');
});

app.get('/developers/me', ensureLoggedIn, (req, res) => {
  res.send(req.user);
});

// Views

app.get('/developers', (req, res) => {
  // render a dev portal homepage
  res.render('developer.hbs', {
    pageTitle: 'Middleman Developer Portal'
  });
});

app.get('/functions', (req, res) => {
  // render a dev portal homepage
  res.render('functions.hbs', {
    pageTitle: 'Middleman Developer Portal'
  });
});

app.get('/account', ensureLoggedIn, (req, res) => {
  // render an account settings page
  res.render('account.hbs', {
    pageTitle: 'Middleman | Account Settings',
    account: req.user
  });
});

// API

// get all wallets by a given developer
app.get('/wallets', authenticate, (req, res) => {
  getWalletByDeveloper(req.developer._id).then((wallets) => {

    wallets = wallets.map(wallet => {
      let pickedObj = _.pick(wallet, ['_id', 'address', 'user_id']);
      return pickedObj;
    });

    res.send({wallets});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// get all wallets for a user
app.get('/wallets/user/:userid', authenticate, (req, res) => {
  getWalletsByUserId(req.params.userid, req.developer._id).then((wallets) => {

    wallets = wallets.map(wallet => {
      let pickedObj = _.pick(wallet, ['_id', 'address', 'user_id']);
      return pickedObj;
    });

    res.send({wallets});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// get the wallet at an address
app.get('/wallets/address/:addr', authenticate, (req, res) => {
  getWalletByAddr(req.params.addr, req.developer._id).then((wallet) => {

    wallet = _.pick(wallet, ['_id', 'address', 'user_id']);

    res.send({wallet});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// get the wallet by its id
app.get('/wallets/:id', authenticate, (req, res) => {
  getWalletById(req.params.id, req.developer._id).then((wallet) => {

    wallet = _.pick(wallet, ['_id', 'address', 'user_id']);

    res.send({wallet});
  }, (err) => {
    if (err = '404') {
      return res.status(404).send();
    } else {
      res.status(400).send();
    }
  });
});

// get balance for a wallet by wallet id
app.get('/wallets/:id/balance', authenticate, (req, res) => {
  getWalletBalance(req.params.id, req.developer._id).then((balance) => {
    res.send({balance});
  }, (err) => {
    res.status(400).send(err);
  });
}, (err) => {
  res.status(400).send(err);
});

// get balance for a wallet by its addr
app.get('/wallets/address/:addr/balance', authenticate, (req, res) => {
  getWalletIdByAddr(req.params.addr, req.developer._id).then((walletId) => {
    getWalletBalance(walletId, req.developer._id).then((balance) => {
      res.send({balance});
    }, (err) => {
      res.status(400).send(err);
    }, (err) => {
      res.status(400).send(err);
    }, (err) => {
      res.status(400).send(err);
    });
  });
});

// create a wallet
app.post('/wallets', authenticate, (req, res) => {
  createWallet(req.body.user_id, req.developer._id).then((wallet) => {
    wallet = _.pick(wallet, ['_id', 'address', 'user_id']);
    res.send({wallet});
  }, (err) => {
    res.status(400).send(err);
  });
});

// signTxn by wallet by addr
app.post('/wallets/address/:addr/signTransaction', authenticate, (req, res) => {
  signTransactionByAddr(req.params.addr, req.developer._id, req.body.transaction).then((signedTransaction) => {
    res.send({signedTransaction});
  }, (err) => {
    console.log(err);
    res.status(400).send();
  });
}, (err) => {
  console.log(err);
  res.status(400).send();
});

// signTxn by wallet by wallet id
app.post('/wallets/:id/signTransaction', authenticate, (req, res) => {
  signTransaction(req.params.id, req.developer._id, req.body.transaction).then((signedTransaction) => {
    res.send({signedTransaction});
  }, (err) => {
    console.log(err);
    res.status(400).send();
  });
}, (err) => {
  console.log(err);
  res.status(400).send();
});

// recoverTxn by wallet by addr
app.post('/wallets/address/:addr/recoverTransaction', authenticate, (req, res) => {
  recoverTransactionByAddr(req.body.rawTransaction, req.params.addr, req.developer._id).then((address) => {
    res.send({address});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// recoverTxn by wallet by wallet id
app.post('/wallets/:id/recoverTransaction', authenticate, (req, res) => {
  recoverTransactionById(req.body.rawTransaction, req.params.id, req.developer._id).then((address) => {
    res.send({address});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// hashmessage given a wallet addr
app.post('/wallets/address/:addr/hashMessage', authenticate, (req, res) => {
  hashMessage(req.body.message).then((hashedMessage) => {
    res.send({hashedMessage});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// hashmessage given a wallet id
app.post('/wallets/:id/hashMessage', authenticate, (req, res) => {
  hashMessage(req.body.message).then((hashedMessage) => {
    res.send({hashedMessage});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// sign data given a wallet address
app.post('/wallets/address/:addr/sign', authenticate, (req, res) => {
  signMessageByAddr(req.params.addr, req.developer._id, req.body.message).then((message) => {
    res.send({message});
  }, (err) => {
    res.status(400).send();
  });
}, (err) => {
  res.status(400).send();
});

// sign data given wallet id
app.post('/wallets/:id/sign', authenticate, (req, res) => {
  signMessage(req.params.id, req.developer._id, req.body.message).then((message) => {
    res.send({message});
  }, (err) => {
    res.status(400).send();
  });
}, (err) => {
  res.status(400).send();
});

// TODO
// recover signature given a wallet address
app.post('/wallets/address/:addr/recover', authenticate, (req, res) => {

});

// TODO
// recover signature given a wallet id
app.post('/wallets/:id/recover', authenticate, (req, res) => {

});

// TODO: this can be deleted, ui will need to be updated
app.get('/wallets/developer/:developerId', authenticate, (req, res) => {
  getWalletByDeveloper(req.developer._id).then((wallets) => {

    wallets = wallets.map(wallet => {
      let pickedObj = _.pick(wallet, ['_id', 'address', 'user_id']);
      return pickedObj;
    });

    res.send({wallets});
  }).catch((e) => {
    res.send(e);
  });
});

app.listen(3000, () => {
  console.log('Started listening on port 3000');
});
