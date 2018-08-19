'use strict';

process.env.DEBUG = 'actions-on-google:*';

const functions = require('firebase-functions');
const app = require('./app');

module.exports.quiz = functions.https.onRequest(app);