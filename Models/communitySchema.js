const { Schema, model } = require("mongoose");

const communitySchema = new Schema(
	{
		id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "user",
		},
	},
	{ timestamps: true },
);

const Community = model("community", communitySchema);

module.exports = Community;
