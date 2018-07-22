var request = require('request');
var {getWalletById} = require('./get-wallet-by-id');

var getWalletBalance = (walletId, developerId) => {
  return new Promise((resolve, reject) => {
    console.log('in wallet balance funtion. wallet id is: ', walletId, 'devId is: ', developerId);

    getWalletById(walletId, developerId).then((wallet) => {
      console.log('got the wallet! wallet address is: ', wallet.address);
      var query = `{ethereumAddress(address: \"${wallet.address}\") {balance { ether }}}`;

      // search Cleargraph for the wallet balance
      request({
        url: 'https://api.cleargraph.com/',
        json: true,
        method: 'POST',
        body: {"query":query}
      }, (err, res, body) => {
          if (err) { console.log(err); reject(err) }

          var balance = res.body.data.ethereumAddress.balance.ether;
          console.log('balance is: ', balance);
          resolve(balance)
      });
    });
  });
};

getWalletBalance('5b54fd0b14d5ce92608d8903', '5b54ed45df543f665f76afd3');

module.exports = {getWalletBalance}
