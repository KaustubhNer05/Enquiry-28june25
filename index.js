const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const {MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());
console.log("Mongo URL:", process.env.MONGODB_URL);


app.post("/save", (req, res) => {
	const url = process.env.MONGODB_URL;
	console.log(url);
	const con = new MongoClient(url);
	const db = con.db("enquiry_28june25");
	const coll = db.collection("enquiry");
	const doc = {"name":req.body.name, "phone":req.body.phone, "query":req.body.query, "en_dt": new Date().toString() };
	coll.insertOne(doc)
	.then( response => {

	// Transporter object
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth : {
	user: process.env.EMAIL_USER,
	pass: process.env.EMAIL_PASS
	}
	});

	let mailOptions = {
		from: "nerkaustubh05@gmail.com",
		to : "nerkaustubh05@gmail.com",
		subject: "Enquiry from " + req.body.name,
		text: "Contact Info: " + req.body.phone + "\nQuery = " +req.body.query,
	};

	// Send Email
	transporter.sendMail(mailOptions, (error, info) => {
	if (error) {
		console.log(error);
		return res.status(500).json(error);
	}
	return res.status(200).json("mail send");
	});
	})
	.catch( err => {
		res.status(500).send(error);
	});
});

app.listen( 9000, () => {console.log("ready to serve @ 9000"); } );
