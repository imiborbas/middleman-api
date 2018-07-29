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

// Views

app.get('/login', (req, res) => {
  // render a login page
  res.render('login.hbs', {
    pageTitle: 'Login'
  })
})

app.get('/signup', (req, res) => {
  // render a signup page
  res.render('signup.hbs', {
    pageTitle: 'Sign Up'
  })
})


app.get('/developers', (req, res) => {
 // render a dev portal homepage
 res.render('developer.hbs', {
   pageTitle: 'Middleman Developer Portal'
 })
})

app.get('/functions', (req, res) => {
 // render a dev portal homepage
 res.render('functions.hbs', {
   pageTitle: 'Middleman Developer Portal'
 })
})

app.get('/account', (req, res) => {
  // render an account settings page
  res.render('account.hbs', {
    pageTitle: 'Middleman | Account Settings'
  })
})

// API

// get all wallets by a given developer
app.get('/wallets', authenticate, (req, res) => {
  getWalletByDeveloper(req.developer._id).then((wallets) => {
    res.send({wallets});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// get all wallets for a user
app.get('/wallets/user/:userid', authenticate, (req, res) => {
 getWalletsByUserId(req.params.userid, req.developer._id).then((wallets) => {
   res.send({wallets});
 }).catch((e) => {
   res.status(400).send(e);
 })
})

// get the wallet at an address
app.get('/wallets/address/:addr', authenticate, (req, res) => {
  getWalletByAddr(req.params.addr, req.developer._id).then((wallet) => {
    res.send({wallet});
  }).catch((e) => {
    res.status(400).send(e);
  })
})

// get the wallet by its id
app.get('/wallets/:id', authenticate, (req, res) => {
  getWalletById(req.params.id, req.developer._id).then((wallet) => {
    res.send({wallet});
  }, (err) => {
    if (err = '404') {
      return res.status(404).send();
    } else {
      res.status(400).send();
    }
  });
})

// get balance for a wallet by wallet id
app.get('/wallets/:id/balance', authenticate, (req, res) => {
  getWalletBalance(req.params.id, req.developer._id).then((balance) => {
    res.send({balance});
  }, (err) => {
    res.status(400).send(err);
  })
  }, (err) => {
  res.status(400).send(err);
})

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
    })
  })
})

// create a wallet
app.post('/wallets', authenticate, (req, res) => {
  createWallet(req.body.user_id, req.developer._id).then((wallet) => {
    res.send({wallet});
  }, (err) => {
    res.status(400).send(err);
  })
})

// signTxn by wallet by addr
app.post('/wallets/address/:addr/signTransaction', authenticate, (req, res) => {
  signTransactionByAddr(req.params.addr, req.developer._id, req.body.transaction).then((signedTransaction) => {
    res.send({signedTransaction});
  }, (err) => {
    console.log(err);
    res.status(400).send();
  })
}, (err) => {
  console.log(err);
  res.status(400).send();
})

// signTxn by wallet by wallet id
app.post('/wallets/:id/signTransaction', authenticate, (req, res) => {
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

// TODO
// recoverTxn by wallet by addr
app.post('/wallets/address/:addr/recoverTransaction', authenticate, (req, res) => {
  recoverTransactionByAddr(req.body.rawTransaction, req.params.addr, req.developer._id).then((address) => {
    res.send({address});
  }).catch((e) => {
    res.status(400).send(e);
  })
})

// TODO
// recoverTxn by wallet by wallet id
app.post('/wallets/:id/recoverTransaction', authenticate, (req, res) => {
  recoverTransactionById(req.body.rawTransaction, req.params.id, req.developer._id).then((address) => {
    res.send({address});
  }).catch((e) => {
    res.status(400).send(e);
  })
})

// TODO
// hashmessage given a wallet addr
app.post('/wallets/address/:addr/hashMessage', authenticate, (req, res) => {

})

// TODO
// hashmessage given a wallet id
app.post('/wallets/:id/hashMessage', authenticate, (req, res) => {

})

// TODO
// sign data given a wallet address
app.post('/wallets/address/:addr/sign', authenticate, (req, res) => {

})

// TODO
// sign data given wallet id
app.post('/wallets/:id/sign', authenticate, (req, res) => {

})

// TODO
// recover signature given a wallet address
app.post('/wallets/address/:addr/recover', authenticate, (req, res) => {

})

// TODO
// recover signature given a wallet id
app.post('/wallets/:id/recover', authenticate, (req, res) => {

})

// TODO: this can be deleted, ui will need to be updated
app.get('/wallets/developer/:developerId', authenticate, (req, res) => {
  getWalletByDeveloper(req.developer._id).then((wallets) => {
      res.send({wallets});
  }).catch((e) => {
    res.send(e);
  });
});

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

// Sign a message by wallet address
app.post('/wallets/address/:addr/sign_message', authenticate, (req, res) => {
  signMessageByAddr(req.params.addr, req.developer._id, req.body.message).then((message) => {
    res.send({message});
  }, (err) => {
    res.status(400).send();
  })
}, (err) => {
  res.status(400).send();
})

// Sign up
app.post('/developers/signup', (req, res) => {
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
app.post('/developers/login', (req, res) => {
  // find a dev with the email and hashed pw that = plain text pw
  var body = _.pick(req.body, ['email', 'password']);

  Developer.findByCredentials(body.email, body.password).then((developer) => {
    // generate a new token and send it back
    res.header('x-auth-key', developer.authToken).send({developer});
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
