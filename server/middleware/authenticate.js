var {Developer} = require('./../db/models/developer');

var authenticate = (req, res, next) => {
  var authToken = req.header('x-auth-key');
  console.log('in authenticate middleware, req.header is: ', req.header('x-auth-key'));

  Developer.findByAuthToken(authToken).then((developer) => {
    if (!developer) {
      // valid token, but no user
      console.log('no user with that token');
      res.status(401).send();
    }
    req.developer = developer;
    req.authToken = authToken;
    console.log('authed: ', req.developer);
    next();
  }).catch((err) => {
    console.log('auth token not valid: ', authToken);
    console.log(err);
    res.status(401).send();
  });
};

module.exports = {authenticate};
