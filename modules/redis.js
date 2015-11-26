var config = require('../config');
var redis = require('redis');

var client = redis.createClient(config.redis.redisUrl);

module.exports = client;