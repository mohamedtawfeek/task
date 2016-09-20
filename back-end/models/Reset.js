var mongoose = require('mongoose');

module.exports = mongoose.model('Reset',{
    email: String
});