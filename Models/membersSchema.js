const { Schema, model } = require("mongoose");

const membersSchema = new Schema(
	{
		id: {
			type: String,
			required: true,
		},
		community: {
			type: String,
			required: true,
		},
		user: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const Member = model("member", membersSchema);

module.exports = Member;
