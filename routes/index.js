var tinyUrl = require('../controllers/tinyUrlController');

var express = require('express');
var router = express.Router();

router.get('/experiment/api/v1/shortner/:code', tinyUrl.getTinyUrl);
router.post('/experiment/api/v1/shortner/', tinyUrl.createTinyUrl);

module.exports = router;