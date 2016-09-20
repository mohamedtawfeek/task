var User = require('../models/user');
var Reset = require('../models/reset');
var passwordHash = require('password-hash');
var jwt = require('jwt-simple');
var moment = require('moment');
module.exports = {
    register: function(req, res) {
        User.findOne({
            email: req.body.email
        }, function(err, existingUser) {
            if (existingUser) return res.status(409).send({
                message: 'Email is already registered'
            });
            var hashedPassword = passwordHash.generate(req.body.pwd);
            var userReg = {
                email: req.body.email,
                pwd: hashedPassword
            };
            var user = new User(userReg);
            user.save(function(err, result) {
                if (err) {
                    res.status(500).send({
                        message: err.message
                    });
                }
                res.status(200).send({
                    token: createToken(result)
                });
            })
        });
    },
    login: function(req, res) {
        User.findOne({
            email: req.body.email
        }, function(err, user) {
            if (!user) return res.status(401).send({
                message: 'Email or Password invalid'
            });
            var DBhashedPassword = user.pwd;
            if (passwordHash.verify(req.body.pwd, DBhashedPassword)) {
                res.send({
                    token: createToken(user)
                });
            } else {
                return res.status(401).send({
                    message: 'Invalid email and/or password'
                });
            }
        });
    },
    reset: function(req, res) {
        User.findOne({
            email: req.body.email
        }, function(err, user) {
            if (!user) {
                return res.status(401).send({
                    message: 'Email invalid'
                });
            } else {
                var resetPwd = passwordHash.generate(req.body.pwd);
                user.pwd = resetPwd;
                user.save();
                return res.status(200).send({
                    message: 'Changed Successfully'
                });
            }
        });
    }
}

function createToken(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, 'secret');
}