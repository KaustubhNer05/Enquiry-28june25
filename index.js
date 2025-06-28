const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

console.log("Mongo URL:", process.env.MONGODB_URL);

app.post("/save", async (req, res) => {
	const url = process.env.MONGODB_URL;

	if (!url) {
		return res.status(500).json({ error: "MongoDB URL not found in .env" });
	}

	const client = new MongoClient(url);

	try {
		await client.connect(); // ✅ Proper DB connection

		const db = client.db("enquiry_28june25");
		const coll = db.collection("enquiry");

		const doc = {
			name: req.body.name,
			phone: req.body.phone,
			query: req.body.query,
			en_dt: new Date().toString()
		};

		await coll.insertOne(doc);

		let transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS
			}
		});

		let mailOptions = {
			from: "nerkaustubh05@gmail.com",
			to: "nerkaustubh05@gmail.com",
			subject: "Enquiry from " + req.body.name,
			text: "Contact Info: " + req.body.phone + "\nQuery = " + req.body.query
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log("Mail error:", error);
				return res.status(500).json(error);
			}
			console.log("Mail sent:", info.response);
			return res.status(200).json("mail send");
		});
	} catch (err) {
		console.log("Server Error:", err);
		res.status(500).json({ error: "Something went wrong on the server" });
	} finally {
		await client.close(); // ✅ Always close the connection
	}
});

app.listen(9000, () => {
	console.log("ready to serve @ 9000");
});
