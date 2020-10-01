const functions = require('firebase-functions');
import * as express from 'express';
import * as cors from 'cors';
// import { firebase } from './config/config';

const app = express();
app.use(cors({ origin: true }));

require('./endpoints/users.ts');

exports.app = functions.https.onRequest(app);
