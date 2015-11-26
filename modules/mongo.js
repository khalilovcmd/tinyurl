var config = require('../config');
var mongoose = require('mongoose');

//var mongo = mongoose.connect(config.mongodb.url);

console.log(mongoose.connection);
mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + dbURI);
}); 

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 


module.exports = mongoose;