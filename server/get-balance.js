var request = require('request');
var {getWalletById} = require('./get-wallet-by-id');

var getWalletBalance = (id) => {
  return new Promise((resolve, reject) => {

    getWalletById(id).then((wallet) => {

      var query = `{ethereumAddress(address: \"${wallet.address}\") {balance { ether }}}`;

      // search Cleargraph for the wallet balance
      request({
        url: 'https://api.cleargraph.com/',
        json: true,
        method: 'POST',
        body: {"query":query}
      }, (err, res, body) => {
          if (err) { reject(err) }

          var balance = res.body.data.ethereumAddress.balance.ether;
          console.log(balance);
          resolve(balance)
      });
    }, (err) => {
      console.log(err);
      reject(err);
    })
  }, (err) => {
    console.log(err);
    reject(err);
  })
};

module.exports = {getWalletBalance}
