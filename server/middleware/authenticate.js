var {Developer} = require('./../db/models/developer');

var authenticate = (req, res, next) => {
  var authToken = req.header('x-auth-key');

  Developer.findByAuthToken(authToken).then((developer) => {
    if (!developer) {
      // valid token, but no user
      res.status(401).send();
    }
    req.developer = developer;
    req.authToken = authToken;
    next();
  }).catch((err) => {
    res.status(401).send();
  });
};

module.exports = {authenticate};
