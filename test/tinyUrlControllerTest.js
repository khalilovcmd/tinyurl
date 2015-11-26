var assert = require('assert');
var should = require('should');
var supertest = require('supertest');

var Url = require('../models/url');
var redis = require('../modules/redis');
var tinyUrl = require('../controllers/tinyUrlController');

var server = supertest.agent("http://localhost:3000");

describe('TinyUrlController', function () {

    var CORRECT_TEST_KEY = 'TEST_KEY',
        WRONG_TEST_KEY = 'W_TEST_KEY';

    var CORRECT_MONGO_TEST_OBJECT = {
            hash: 'cceae51172f9e28736b1fd0db72b3d17',
            url: 'www.nerd-in-dubai.com',
            code: 'aa11bb22'
        },
        WRONG_MONGO_TEST_OBJECT = {
            hash: 'XYZ',
            url: 'www.apis.nerd-in-dubai.com',
            code: 'aa11bb22'
        };

    this.timeout(5000);

    before(function (done) {
        redis.set(CORRECT_TEST_KEY, 1, function (err, reply) {
            done()
        });
    });

    before(function (done) {
        new Url(CORRECT_MONGO_TEST_OBJECT).save(function (err, url) {
            done()
        });
    });

    it('it should createTinyUrl', function (done) {

        server
            .post('/experiment/api/v1/shortner/')
            .send({
                url: 'www.nerd-in-dubai.com'
            })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(201)
            .end(function (err, res) {
                if (err)
                    throw err;
                done();
            });
    });

    it('it should getTinyUrl', function () {

        server
            .post('/experiment/api/v1/shortner/4kh1nbexl')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err)
                    throw err;
                done();
            });

    });

    it('it should NOT getTinyUrl', function () {

        server
            .post('/experiment/api/v1/shortner/falsecode')
            .set('Accept', 'application/json')
            .expect(400)
            .end(function (err, res) {
                if (err)
                    throw err;
                done();
            });

    });

    it('it should generate a shortid with only 6 characters', function () {});

    it('it should generate a hash', function () {
        tinyUrl._generateHash.bind(null, 'www.heroku.com').should.not.be.empty;
    });

    it('it should NOT generate a hash', function () {
        tinyUrl._generateHash.bind(null, null).should.throw();
    });

    it('it should find + get key in Redis', function (done) {
        tinyUrl._getFromRedis(CORRECT_TEST_KEY, function (res, val) {
            res.should.be.ok;
            val.should.equal('1');
            done();
        });
    });

    it('it should persist in Redis', function (done) {
        tinyUrl._persistInRedis(CORRECT_MONGO_TEST_OBJECT, function (res, val) {
            res.should.be.ok;
            done();
        });
    });


    it('it should persist in Mongo', function (done) {
        tinyUrl._persistInMongo(CORRECT_MONGO_TEST_OBJECT, function (res, val) {
            res.should.be.ok;
            done();
        });

    });

    it('it should find + get key in Redis', function (done) {
        tinyUrl._getFromRedis(CORRECT_TEST_KEY, function (res, val) {
            res.should.be.ok;
            val.should.equal('1');
            done();
        });
    });

    it('it should get object from mongo by hash', function (done) {
        tinyUrl._getFromMongo(CORRECT_MONGO_TEST_OBJECT.hash, null, function (res, val) {
            res.should.be.ok;
            val.hash.should.equal(CORRECT_MONGO_TEST_OBJECT.hash);
            done();
        });
    });

    it('it should NOT get object from mongo by hash', function (done) {
        tinyUrl._getFromMongo(WRONG_MONGO_TEST_OBJECT.hash, null, function (res) {
            res.should.not.be.ok;
            done();
        });
    });

});