const functions = require('firebase-functions');
import * as express from 'express';
import * as cors from 'cors';
import * as admin from 'firebase-admin';

const app = express();
app.use(cors({ origin: true }));

const serviceAccount = require('../permissions.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://mdshat-1ae4d.firebaseio.com'
});
const db = admin.firestore();


////// USERS ///////

app.post('/api/users', (req: any, res: any) => {
	admin
		.auth()
		.createUser({
			email: req.body.email,
			emailVerified: false,
			password: req.body.password
		})
		.then(function (userRecord) {
			res.status(200).send('Ok')
			console.log(userRecord)
		})
		.catch(function (error) {
			console.log('Error creating new user:', error);
		});
});

app.get('/api/users/:uid', (req: any, res: any) => {
	admin
		.auth()
		.getUser(req.params.uid)
		.then(function (userRecord) {
			console.log('Successfully fetched user data:', userRecord.toJSON());
			res.status(200).send(userRecord);
		})
		.catch(function (error) {
			res.stats(500).send('Error fetching user data:', error);
		});
});

app.post('/api/me', (req: any, res: any) => {
	admin.auth().verifyIdToken(req.body.idToken)
		.then(function(decodedToken) {
			const uid = decodedToken.uid;
			res.status(200).send('Ok')
			return uid;
		}).catch(function(error) {
		res.status(200).send('Ok')
		return ("ERROR")
	});
})

////// CHAT ///////

app.post('/api/messages', (req, res) => {
	(async () => {
		try {
			await db
				.collection('messages')
				.doc('/' + req.body.id + '/')
				.create({
					user_id: req.body.user_id,
					channel_id: req.body.channel_id,
					content: req.body.content
				});
			return res.status(200).send();
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

app.get('/api/messages/:id', (req, res) => {
	(async () => {
		try {
			const document = db.collection('messages').doc(req.params.id);
			const item = await document.get();
			const response = item.data();
			return res.status(200).send(response);
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

app.get('/api/messages/:user_id', async (req, res) => {
	try {
		const userQuerySnapshot = await db.collection('messages').get();
		const messages: any[] = [];
		userQuerySnapshot.forEach((doc) => {
			messages.push({
				id: doc.id,
				data: doc.data()
			});
		});
		res.status(200).json(messages);
	} catch (error) {
		res.status(500).send(error);
	}
});

////// CHANNEL ///////

app.post('/api/channels', (req, res) => {
	(async () => {
		try {
			await db
				.collection('channels')
				.doc('/' + req.body.id + '/')
				.create({
					name: req.body.name,
					is_private: req.body.is_private
				});
			return res.status(200).send();
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

app.get('/api/channels/:id', (req, res) => {
	(async () => {
		try {
			const document = db.collection('channels').doc(req.params.id);
			const item = await document.get();
			const response = item.data();
			return res.status(200).send(response);
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

exports.app = functions.https.onRequest(app);
