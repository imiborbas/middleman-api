const {MongoClient} = require('mongodb');
const mongoose = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/MiddlemanDB';

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl);

module.exports = {mongoose};
