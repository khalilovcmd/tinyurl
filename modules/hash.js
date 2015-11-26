var crypto = require('crypto');

var hash = (function () {
    var self = this;

    self.create = function (data) {
        return crypto.createHash('md5').update(data).digest("hex");
    }

    return self;

})();

module.exports = hash;