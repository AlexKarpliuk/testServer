const express = require("express");
const Settler = require('./models/Settler.js')
const Admin = require('./models/Admins.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cookie = require('cookie');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
	origin: 'http://localhost:8080',
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


let databaseCreated = false;

const connectDB = async () => {
	try {
		if (databaseCreated) {
			console.log('Database already created. Skipping connection.');
			return;
		}
		const databaseName = 'traineedb';
		const connectionURL = `mongodb+srv://Alex:300010Sano@portfolio.7au2fgv.mongodb.net/${databaseName}?retryWrites=true&w=majority`;

		const connect = await mongoose.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true });
		console.log(`MongoDB connected to ${connect.connection.host} database: ${databaseName}`);

		databaseCreated = true;
	} catch (error) {
		console.log(error);
	}
};

// Generate a salt to add to the hash
const salt = bcrypt.genSaltSync(10);
const secretKey = '1234567890'

app.post('/admin', async (req, res) => {
	const { login, password } = req.body
	const adminInfo = await Admin.findOne({ login });
	if (!adminInfo) {
		return res.status(400).json({ txt: 'admin not found' })
	}
	const passOk = bcrypt.compareSync(password, adminInfo.password);
	if (!passOk) {
		res.status(400).json({ txt: 'wrong password' })
	} else {
		jwt.sign({ login, id: adminInfo._id }, secretKey, {}, (err, token) => {
			if (err) throw err;
			console.log('Generated token:', token);
			res.cookie('token', token, {
				httpOnly: true,
				secure: true,
				sameSite: 'none'
			}).json({
				id: adminInfo._id,
				login,
				txt: 'success',
				token,
			});
		})
	}
});
// Profile info
app.get('/profile', (req, res) => {
	const { token } = req.cookies;
	if (!token) {
		// If token is empty
		res.status(400).json({ message: 'Token is missing' });
	} else {
		jwt.verify(token, secretKey, {}, (err, info) => {
			if (err) throw err;
			res.json(info);
		});
	}
});


// Logout, clean up the token info
app.post('/logout', (req, res) => {
	res.cookie('token', '', {
		httpOnly: true,
		secure: true,
		sameSite: 'none'
	}).json('ok');
});

app.post('/list', async (req, res) => {
	try {
		const { firstname, lastname } = req.body;
		const settlerInfo = await Settler.create({
			firstname,
			lastname
		});
		if (settlerInfo) {
			res.status(200).json({ success: true });
		} else {
			res.status(400).json({ success: false });
		}
	} catch (error) {
		res.status(500).json({ error: 'something went wrong' });
	}
});

app.get('/', async (req, res) => {
	const posts = await Settler.find()
		.sort({ createdAt: -1 })
	res.json(posts)
});


app.put('/list/:id', async (req, res) => {
	try {
		const id = req.params.id;
		const settlerInfo = await Settler.findById(id);
		if (settlerInfo) {
			res.json(settlerInfo);
		} else {
			res.status(400).json({ success: false });
		}
	} catch (error) {
		res.status(500).json({ error: 'Something went wrong' });
	}
});
app.put('/list/update/:id', async (req, res) => {
	try {
		const id = req.params.id;
		const { firstname, lastname } = req.body;
		const settlerInfo = await Settler.findById(id);
		if (settlerInfo) {
			settlerInfo.firstname = firstname;
			settlerInfo.lastname = lastname;
			await settlerInfo.save();
			res.status(200).json({ success: true });
		} else {
			res.status(400).json({ success: false });
		}
	} catch (error) {
		res.status(500).json({ error: 'Something went wrong' });
	}
});

app.delete('/list/delete/:id', async (req, res) => {
	try {
		const id = req.params.id;
		const settlerInfo = await Settler.findByIdAndDelete(id);
		if (settlerInfo) {
			res.status(200).json('Post deleted successfully');
		} else {
			res.status(400).json({ success: false });
		}
	} catch (error) {
		res.status(500).json({ error: 'Something went wrong' });
	}
});


connectDB().then(() => {
	app.listen(3000, () => {
		console.log('connected')
	});
});