// src/auth/firebase-login.route.js
const express = require('express');
const router = express.Router();
const { firebaseLogin } = require('./firebase-login.controller');

router.post('/firebase-login', firebaseLogin);

module.exports = router;
