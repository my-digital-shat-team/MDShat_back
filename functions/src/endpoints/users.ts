const functions = require('firebase-functions');
import * as express from 'express';
import * as cors from 'cors';
import { firebase } from '../config/config';

const app = express();
app.use(cors({ origin: true }));

const actionCodeSettings = {
	// URL you want to redirect back to. The domain (www.example.com) for
	// this URL must be whitelisted in the Firebase Console.
	url: '',
	// This must be true for email link sign-in.
	handleCodeInApp: true,
	iOS: {
		bundleId: 'fr.mds.mydigitalshat',
	},
	android: {
		packageName: 'fr.mds.mydigitalshat',
		installApp: true,
		minimumVersion: '12',
	},
	// FDL custom domain.
	dynamicLinkDomain: 'coolapp.page.link',
};

app.get('/hello-world2', (req: any, res: any) => {
	return res.status(200).send('Hello World!');
});

app.post('/api/users', (req: any, res: any) => {
	firebase
		.auth()
		.createUser({
			email: req.body.email,
			emailVerified: false,
			password: req.body.password,
		})
		.then(function (userRecord) {
			const verificationLink = firebase
				.auth()
				.generateEmailVerificationLink(
					req.body.email,
					actionCodeSettings
				);
		})
		.catch(function (error) {
			console.log('Error creating new user:', error);
		});
});

exports.app = functions.https.onRequest(app);
