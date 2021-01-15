const models = require('../models');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require("../config/keys").token;

function signUp(req, res) {
    //Sign up
    console.log(req.body);
    models.User.findOne({where: {email: req.body.email}}).then(result => {
        if (result) {
            res.status(409).json({
                message: "Email already exists!",
            });
        } else {
            bcryptjs.genSalt(10, function (err, salt) {
                bcryptjs.hash(req.body.password, salt, function (err, hash) {
                    const user = {
                        name: req.body.name,
                        email: req.body.email,
                        password: hash
                    }

                    models.User.create(user).then(result => {
                        res.status(201).json({
                            message: "User created successfully",
                        });
                    }).catch(error => {
                        res.status(500).json({
                            message: "Something went wrong!",
                        });
                    });
                });
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
        });
    });
}

function login(req, res) {
    models.User.findOne({where: {email: req.body.email}}).then(user => {
        if (user === null) {
            res.status(401).json({
                message: "Invalid credentials!",
            });
        } else {
            bcryptjs.compare(req.body.password, user.password, (err, result) => {
                if (result) {
                    const token = jwt.sign({
                        email: user.email,
                        userId: user.id
                    }, keys.jwt,  (err, token) => {
                        res.status(200).json({
                            token: token,
                            message: "Authentication successful!"
                        });
                    });
                } else {
                    res.status(401).json({
                        message: "Invalid credentials!",
                    });
                }
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
        });
    });
}

module.exports = {
    signUp: signUp,
    login: login
}