const {MongoClient} = require('mongodb');
const mongoose = require('mongoose');
// const dbUrl = `mongodb://middleman-db-admin:${process.env.MONGO_AUTH_TOKEN}@middlemancluster-shard-00-00-q7fao.gcp.mongodb.net:27017,middlemancluster-shard-00-01-q7fao.gcp.mongodb.net:27017,middlemancluster-shard-00-02-q7fao.gcp.mongodb.net:27017/MiddlemanDB?ssl=true&replicaSet=MiddlemanCluster-shard-0&authSource=admin&retryWrites=true`;
const dbUrl = 'mongodb://localhost:27017/MiddlemanDB';

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl);

module.exports = {mongoose};
