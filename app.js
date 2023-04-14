require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middleware/checkAuthToken");
const { connectToMongoDB } = require("./connect");
const communityRoutes = require("./routes/community");
const memberRoutes = require("./routes/member");
const roleRoutes = require("./routes/role");
const userRoutes = require("./routes/user");
const app = express();
const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// -------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 8080;
const URL = process.env.MONGODB_URL;
connectToMongoDB(URL).then(() => console.log("Mongodb connected"));
// -------------------------------------------------------------------------------------------------
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.get("/", (req, res) => {
	res.send("Hi !");
});

app.use("/v1/auth", userRoutes);
app.use("/v1/role", roleRoutes);
app.use("/v1/member", memberRoutes);
app.use("/v1/community", communityRoutes);
app.listen(PORT, () =>
	console.log(`Server Started at PORT:${PORT}  http://localhost:${PORT}/`),
);

module.exports = app;
