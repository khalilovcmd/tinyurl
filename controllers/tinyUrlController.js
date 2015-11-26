var redis = require('../modules/redis');
var mongo = require('../modules/mongo');
var hash = require('../modules/hash');
var Url = require('../models/url');

var shortid = require('shortid');
var asyncjs = require('async');

var tinyUrl = (function () {

    var self = this;

    // get url hash's value from redis
    self._getFromRedis = function (hash, result) {

        if (hash && result) {
            redis.get(hash, function (err, val) {

                if (val)
                    result(true, val);
                else
                    result(false);
            });
        } else {
            throw new Error('argument is null or undefined.');
        }
    }

    // get url value from mongo
    self._getFromMongo = function (hash, code, result) {

        if (hash && result) {
            Url.findOne({
                'hash': hash
            }, function (err, val) {

                if (err)
                    result(false);

                if (val)
                    result(true, val);
                else
                    result(false);
            });
        } else if (code && result) {
            Url.findOne({
                'code': code
            }, function (err, val) {

                if (err)
                    result(false);

                if (val)
                    result(true, val);
                else
                    result(false);
            });
        } else {
            throw new Error('argument is null or undefined.');
        }
    }

    // persist url into mongo
    self._persistInMongo = function (url, result) {
        new Url(url).save(
            function (err, val) {

                if (err)
                    result(false);
                else
                    result(true);
            });
    }

    // persist url into redis (key: hash, val: url)
    self._persistInRedis = function (url, result) {

        redis.multi([
            ["setex", url.hash, 24 * 60 * 60, url.code],
            ["setex", url.code, 24 * 60 * 60, url.url]])
            .exec(function (err, replies) {

                if (replies && replies.every(function (r) { return r == 'OK'}))
                    result(true);
                else
                    result(false);

            });

    }

    // generate MD5 hash of the url
    self._generateHash = function (url) {
        if (url)
            return hash.create(url);
        else
            throw new Error('url argument is null or undefined.');
    }

    // generate a short lowercase id
    self._generateShortId = function () {
        return shortid.generate().toLowerCase();
    }

    self.createTinyUrl = function (req, res, next) {

        // 0. create a hash of the input url
        // 1. check if it exists in Redis
        //    if yes, return the tinyurl
        // 2. check if it exists in mongo
        //    if yes, return the tinyurl + persist in redis (for more efficient later retrieval)
        // 3. create tiny-url
        // 4. persist in redis (expiry one day only) + mongo
        // 5. return tiny-url


        asyncjs.waterfall([
            function (next) {

                    // 0. create a hash of the input url (json body)
                    var url = req.body.url;

                    next(null, {
                        url: url,
                        hash: hash.create(url),
                        code: null
                    });
                },
                function (url, next) {

                    console.log('checking in redis ..');

                    // 1. check if it exists in Redis
                    self._getFromRedis(url.hash,
                        function (result, val) {
                            if (result) {
                                url.code = val;
                                next('done', url);
                            } else {
                                next(null, url);
                            }
                        });
                },
            function (url, next) {

                    console.log('checking in mongo ..');

                    // 2. check if it exists in mongo
                    self._getFromMongo(url.hash, null, function (result, val) {
                        if (result) {

                            self._persistInRedis(val, function (result1, val1) {
                                url.code = val1;
                                if (result1) {
                                    next('done', url);
                                } else {
                                    next('error', url);
                                }
                            });
                        } else {
                            next(null, url);
                        }
                    });
            },
            function (url, callback) {

                    console.log('creating tiny url ..');

                    // 3. create tiny url
                    var code = shortid.generate().toLowerCase();
                    url.code = code;

                    callback(null, url);
            },
            function (url, callback) {

                    console.log('persisting in redis ..');

                    // 4. persist in redis (expiry one day)
                    self._persistInRedis(url, function (result, val) {
                        callback(null, url);
                    });
            },
            function (url, callback) {

                    console.log('persisting in mongo ..');

                    // 4. persist in mongodb
                    self._persistInMongo(url, function (result, val) {
                        callback('done', url);
                    });
            }],
            function (err, result) {
                if (err == 'done') {
                    res.status(201).send(result.code);
                } else {
                    res.status(400).send(err);
                }
            });
    }

    self.getTinyUrl = function (req, res, next) {

        // 0. create a hash of the input url
        // 1. check if it exists in Redis
        //    if yes, return the tinyurl
        // 2. check if it exists in mongo
        //    if yes, return the tinyurl + persist in redis (for more efficient later retrieval)
        // 3. return tiny-url OR return error

        asyncjs.waterfall([
            function (next) {

                    // 0. create a hash of the input url (json body)
                    var code = req.params.code;

                    if (code) {
                        next(null, {
                            code: code
                        });
                    } else {
                        next('error', null);
                    }
                },
                function (url, next) {

                    console.log('checking in redis ..');

                    // 1. check if it exists in Redis
                    self._getFromRedis(url.code,
                        function (result, val) {
                            if (result) {
                                next('done', val);
                            } else {
                                next(null, url);
                            }
                        });
                },
            function (url, next) {

                    console.log('checking in mongo ..');

                    // 2. check if it exists in mongo
                    self._getFromMongo(null, url.code, function (result, val) {
                        if (result) {
                            self._persistInRedis(val, function (result1, val) {

                                if (result1) {
                                    next('done', val);
                                } else {
                                    next('error', url);
                                }
                            });
                        } else {
                            next(null, url);
                        }
                    });
            }],
            function (err, result) {
                if (err == 'done') {
                    res.status(200).send(result);
                } else {
                    res.status(400).send();
                }
            });
    }

    return self;
})();

module.exports = tinyUrl;