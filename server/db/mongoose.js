const {MongoClient} = require('mongodb');
const mongoose = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/CashewDB';

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl);

module.exports = {mongoose};
