const { Router } = require("express");
const { createTokenForUser, validateToken } = require("../services/authJWT");
const { Snowflake } = require("@theinternetfolks/snowflake");
const { body, validationResult } = require("express-validator");
const User = require("../Models/userSchema");

const router = Router();

router.post(
	"/signup",
	body("name").isLength({
		min: 2,
	}),
	body("email")
		.isEmail()
		.custom((value) => {
			return User.find({
				email: value,
			}).then((user) => {
				if (user.length > 0) {
					throw "This email is taken!";
				}
			});
		}),
	body("password")
		.isStrongPassword({
			minLength: 6,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
		})
		.withMessage(
			"Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number",
		),
	async (req, res) => {
		// console.log(req.body);
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			let errorMessage = "";
			if (errors.array()[0].msg.includes("Invalid")) {
				errorMessage = "Name must be more than 2 characters";
			} else if (errors.array()[0].msg.includes("email")) {
				errorMessage = errors.array()[0].msg;
			} else if (errors.array()[0].msg.includes("Password")) {
				errorMessage = errors.array()[0].msg;
			} else {
				errorMessage = errors.array();
			}
			return res.status(400).json({
				success: false,
				errors: errorMessage,
				// errors: `${errors.array()[0].value} is already taken`,
				// errors: errors.array(),
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
		// const created

		return res
			.status(200)
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
		delete payload._id;
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
	if (req.user === undefined) {
		return res.status(400).json({
			error: "Please signin!",
		});
	}
	const payload = req.user;
	delete payload.iat;
	delete payload._id;
	return res.status(200).json({
		data: {
			...payload,
		},
	});
});

module.exports = router;
