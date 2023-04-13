const { Schema, model } = require("mongoose");

const roleSchema = new Schema(
	{
		id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const Role = model("role", roleSchema);

module.exports = Role;
