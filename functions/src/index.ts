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
// Create a user
app.post('/api/users', async(req: any, res: any) => {
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

// Get all users
app.get('/api/users', async (req:any, res:any) => {
	function listAllUsers(nextPageToken: any) {
		// List batch of users, 1000 at a time.
		const users: { uid: string; email: string | undefined; }[] = [];
		admin.auth().listUsers(1000, nextPageToken)
			.then(function(listUsersResult) {
				listUsersResult.users.forEach(function(userRecord) {
					users.push({
						"uid": userRecord.uid,
						"email": userRecord.email
					})
				});
				if (listUsersResult.pageToken) {
					listAllUsers(listUsersResult.pageToken);
				}
				res.status(200).send(users)
			})
			.catch(function(error) {
				res.status(500).send(`Error while fetching users : ${error}`)
			});
	}
// Start listing users from the beginning, 1000 at a time.
	listAllUsers('0');
})

// Get all selected user channels
app.get('/api/users/:id/channels', async (req, res) => {
	try {
		const channelsRef = db.collection('channel_users')
		const snapshot = await channelsRef.where('user_id', '==', req.params.id).get()
		const channels: any[] = [];
		snapshot.forEach(doc => {
			channels.push(doc.data())
		});
		return res.status(200).json({ channels });
	} catch (err) {
		return res.status(500).send(err)
	}
})

// Get selected user data
app.get('/api/users/:uid', async (req: any, res: any) => {
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

////// CHAT ///////

app.post('/api/messages', async(req, res) => {
		try {
			await db
				.collection('messages')
				.add({
					user_id: req.body.user_id,
					channel_id: req.body.channel_id,
					content: req.body.content
				});
			return res.status(200).send();
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
});

app.get('/api/messages/:id', async (req, res) => {
		try {
			const document = db.collection('messages').doc(req.params.id);
			const item = await document.get();
			const response = item.data();
			return res.status(200).send(response);
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
});

app.get('/api/messages/:channel_id', async (req, res) => {
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

// Create channel
app.post('/api/channels', async(req, res) => {
	try {
		const response = await db
			.collection('channels')
			.add({
				name: req.body.name
			});
		return res.status(200).send({"channel_id": response.id});
	} catch (error) {
		console.log(error);
		return res.status(500).send(error);
	}
});

app.post('/api/channels/add-user', async(req, res) => {
	try {
		await db
			.collection('channel_users')
			.add({
				channel_id: req.body.channel_id,
				user_id: req.body.user_id
			})
		return res.status(200).send();
	} catch (err) {
		return res.status(500).send(err)
	}
})

app.get('/api/channels/:id', async (req, res) => {
	try {
		const doc = await db.collection('channels').doc(req.params.id).get();
		return res.status(200).json(doc.data());
	} catch (error) {
		console.log(error);
		return res.status(500).send(error);
	}
});

exports.app = functions.https.onRequest(app);
