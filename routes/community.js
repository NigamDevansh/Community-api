const { Router } = require("express");
const slugify = require("slugify");
const { Snowflake } = require("@theinternetfolks/snowflake");
const { body, validationResult } = require("express-validator");
const User = require("../Models/userSchema");
const Member = require("../Models/membersSchema");
const Community = require("../Models/communitySchema");
const Role = require("../Models/roleSchema");
const router = Router();

router.post(
	"/",
	body("name").custom((value) => {
		return Community.find({
			name: value,
		}).then((user) => {
			if (user.length > 0) {
				throw "This community name is taken!";
			}
		});
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
		const slug = slugify(name);
		const comm = await Community.create({
			id: Snowflake.generate(),
			name,
			slug,
			owner: req.user._id,
		});
		const id = comm._doc.id;
		const ret = await Community.findOne({ id: id }).populate({
			path: "owner",
			select: "id",
		});
		const obj = {
			id: ret._doc.id,
			name: ret._doc.name,
			owner: ret._doc.owner.id,
			created_at: ret._doc.createdAt,
			updated_at: ret._doc.updatedAt,
		};
		return res.status(200).json({
			status: true,
			content: {
				data: obj,
			},
		});
	},
);

//
router.get("/", async (req, res) => {
	let retObjs = [];
	const objs = await Community.find({}).populate({
		path: "owner",
		select: "id name",
	});

	for (const key in objs) {
		let obj = objs[key];
		const a = {
			id: obj.id,
			name: obj.name,
			slug: obj.slug,
			owner: {
				id: obj.owner.id,
				name: obj.owner.name,
			},
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
		if (index > start && index <= end) {
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

router.get("/me/owner", async (req, res) => {
	if (req.user === undefined) {
		return res.status(404).json({
			error: "Please Signin!",
		});
	}
	const { _id } = req.user;
	const objs = await Community.find({ owner: _id }).populate({
		path: "owner",
		select: "id",
	});

	let retObjs = [];
	for (const key in objs) {
		let obj = objs[key];
		const a = {
			id: obj.id,
			name: obj.name,
			slug: obj.slug,
			owner: obj.owner.id,
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
		if (index > start && index <= end) {
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

async function objsPush(objs, allComm) {
	allComm.forEach((item) => {
		// console.log(item);
		objs.push(item);
	});
	return objs;
}

router.get("/me/member", async (req, res) => {
	if (req.user === undefined) {
		return res.status(404).json({
			error: "Please Signin!",
		});
	}
	const { id } = req.user;
	const memberOf = await Member.find({ user: id });
	// console.log(memberOf);
	const memberOfID = [];
	memberOf.forEach((element) => {
		memberOfID.push(element.community);
	});
	let retObjs = [];
	const setOfmemberOfID = new Set(memberOfID);
	let arr = [];
	setOfmemberOfID.forEach((element) => {
		arr.push(element);
	});
	const objs = await Community.find({
		$or: [{ id: { $in: arr } }],
	}).populate({
		path: "owner",
		select: "id name",
	});
	for (const key in objs) {
		let obj = objs[key];
		const a = {
			id: obj.id,
			name: obj.name,
			slug: obj.slug,
			owner: {
				id: obj.owner.id,
				name: obj.owner.name,
			},
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

router.get("/:id/members", async (req, res) => {
	const id = req.params.id;
	const commDetails = await Community.findOne({ name: id });
	const commID = commDetails.id;
	const allUsersIdOfCommId = await Member.find({ community: commID });
	let retObjs = [];
	for (const key in allUsersIdOfCommId) {
		let obj = allUsersIdOfCommId[key];
		const a = await User.findOne({ id: obj.user });
		const b = await Role.findOne({ name: obj.role });
		const c = {
			id: Snowflake.generate(),
			community: obj.community,
			user: {
				id: a.id,
				name: a.name,
			},
			role: {
				id: b.id,
				role: b.name,
			},
			created_at: a.createdAt,
		};
		retObjs.push(c);
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
