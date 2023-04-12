const { Router } = require("express");
const { createTokenForUser, validateToken } = require("../services/authJWT");
const { Snowflake } = require("@theinternetfolks/snowflake");
const { body, validationResult } = require("express-validator");
const User = require("../Models/userSchema");

const router = Router();

router.post(
	"/signup",
	body("email")
		.isEmail()
		.custom((value) => {
			return User.find({
				email: value,
			}).then((user) => {
				if (user.length > 0) {
					throw "email is taken!";
				}
			});
		}),
	body("password").isLength({
		min: 6,
	}),
	body("name").isLength({
		min: 2,
	}),
	async (req, res) => {
		// console.log(req.body);
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				errors: `${errors.array()[0].value} is already taken`,
			});
		}

		const { name, email, password } = req.body;

		const user = await User.create({
			id: Snowflake.generate(),
			name,
			email,
			password,
		});
		const userDetails = {
			id: user.id,
			name: user.name,
			email: user.email,
			created_at: user.createdAt,
		};

		const token = createTokenForUser(userDetails);
		console.log(user.createdAt);
		// const created

		res.status(200)
			.cookie("token", token)
			.json({
				status: true,
				data: { ...userDetails },
				meta: { token },
			});
	},
);

router.post("/signin", async (req, res) => {
	const { email, password } = req.body;
	try {
		const token = await User.matchedPasswordandGenerateToken(
			email,
			password,
		);

		const payload = validateToken(token);
		delete payload.iat;
		// console.log("Token", token);
		return res
			.status(200)
			.cookie("token", token)
			.json({
				data: { ...payload },
			});
	} catch (error) {
		return res.status(400).json({
			success: false,
			errors: error.message,
		});
	}
});

router.get("/me", (req, res) => {
	console.log(req.cookies);
	const tokenCookieValue = req.cookies["token"];
	if (!tokenCookieValue) {
		return res.status(400).json({
			error: "Please signin",
		});
	}

	try {
		const payload = validateToken(tokenCookieValue);
		req.user = payload;
		delete payload.iat;
		return res.status(200).json({
			data: { ...payload },
		});
	} catch (error) {
		return res.status(400).json({
			success: false,
			errors: error.message,
		});
	}
});

module.exports = router;
