var {Developer} = require('./../db/models/developer');

var authenticate = (req, res, next) => {
  var apiKey = req.header('x-auth-key');

  Developer.findByAPIKey(apiKey).then((developer) => {
    if (!developer) {
      // valid token, but no user
      res.status(401).send();
    }
    req.developer = developer;
    req.apiKey = apiKey;
    next();
  }).catch((err) => {
    res.status(401).send();
  });
};

module.exports = {authenticate};
