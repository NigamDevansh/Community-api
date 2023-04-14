const { Router } = require("express");
const { Snowflake } = require("@theinternetfolks/snowflake");
const Member = require("../Models/membersSchema");
const Community = require("../Models/communitySchema");

const router = Router();

router.post("/", async (req, res) => {
	if (req.user === undefined) {
		return res.status(404).json({
			error: "Please Signin!",
		});
	}
	const { id } = req.user;
	const { community, user, role } = req.body;
	const commId = await Community.findOne({ id: community }).populate({
		path: "owner",
		select: "id",
	});
	if (id != commId.owner.id) {
		return res.status(400).json({
			error: "NOT_ALLOWED_ACCESS",
		});
	}
	let mem = await Member.create({
		id: Snowflake.generate(),
		community,
		user,
		role,
	});
	let member = {
		id: mem.id,
		community: mem.community,
		user: mem.user,
		role: mem.role,
		created_at: mem.createdAt,
	};
	return res.json({
		status: true,
		content: {
			data: member,
		},
	});
});

router.delete("/:id", async (req, res) => {
	if (req.user === undefined) {
		return res.status(404).json({
			error: "Please Signin!",
		});
	}
	const { id } = req.user;
	const commAdminOrMod = await Member.find({
		$or: [{ role: { $in: ["Community Admin", "Community Moderator"] } }],
		user: id,
	});

	const commAdminOrModID = [];
	commAdminOrMod.forEach((element) => {
		commAdminOrModID.push(element.community);
	});
	const setofCommAdminOrModID = new Set(commAdminOrModID);
	console.log(setofCommAdminOrModID);
	const paramsId = req.params.id;
	setofCommAdminOrModID.forEach(async (ele) => {
		await Member.deleteMany({
			user: paramsId,
			community: ele,
		});
	});

	return res.json({
		status: true,
	});
});

module.exports = router;
