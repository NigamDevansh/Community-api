const { Router } = require("express");
const { Snowflake } = require("@theinternetfolks/snowflake");
const { body, validationResult } = require("express-validator");
const Role = require("../Models/roleSchema");

const router = Router();

router.post(
	"/",
	body("name").isLength({
		min: 2,
	}),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				errors: errors.array(),
			});
		}
		if (req.user === undefined) {
			return res.status(404).json({
				error: "Please Signin!",
			});
		}
		const { name } = req.body;
		const role = await Role.create({
			id: Snowflake.generate(),
			name,
		});
		return res.status(200).json({
			status: true,
			content: {
				data: {
					id: role.id,
					name: role.name,
					created_at: role.createdAt,
					updated_at: role.updatedAt,
				},
			},
		});
	},
);

router.get("/", async (req, res) => {
	let retObjs = [];
	const objs = await Role.find({});
	for (const key in objs) {
		let obj = objs[key];
		const a = {
			id: obj.id,
			name: obj.name,
			scope:
				obj.name === "Community Admin"
					? ["member-get", "member-add", "member-remove"]
					: ["member-get"],
			created_at: obj.createdAt,
			updated_at: obj.updatedAt,
		};
		retObjs.push(a);
	}
	let total = retObjs.length;
	let items = 4;
	let pages = parseInt(total / items);
	let page = 1;
	let start = (page - 1) * items;
	let end = start + items;
	let returnArray = [];
	retObjs.forEach((element, index) => {
		if (index >= start && index <= end) {
			returnArray.push(element);
		}
	});

	return res.status(200).json({
		status: true,
		content: {
			meta: {
				total,
				pages,
				page,
			},
			data: returnArray,
		},
	});
});

module.exports = router;
