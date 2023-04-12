require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connect");
const userRoutes = require("./routes/user");
const app = express();

var bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// -------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 8080;
const URL = process.env.MONGODB_URL;
connectToMongoDB(URL).then(() => console.log("Mongodb connected"));
// -------------------------------------------------------------------------------------------------

//tells express how to parse html data coming from form
app.use(express.urlencoded({ extended: false }));
//for parsing the cookie
app.use(cookieParser());

app.get("/", (req, res) => {
	res.send("Hi !");
});

app.use("/v1/auth", userRoutes);
app.listen(PORT, () =>
	console.log(`Server Started at PORT:${PORT}  http://localhost:${PORT}/`),
);
