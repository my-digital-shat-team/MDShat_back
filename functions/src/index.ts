const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
const serviceAccount = require("./permissions.json");
app.use(cors({ origin: true }));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mdshat-1ae4d.firebaseio.com"
});
const db = admin.firestore();

app.get('/hello-world', (req: any, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): any; new(): any; }; }; }) => {
  return res.status(200).send('Hello World!');
});

exports.app = functions.https.onRequest(app);
