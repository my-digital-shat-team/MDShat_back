const serviceAccount = require('../permissions.json');

import * as admin from 'firebase-admin';

export const firebase = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://mdshat-1ae4d.firebaseio.com',
});
