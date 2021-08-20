/* Student mongoose model */
const mongoose = require("mongoose");

const Event = mongoose.model("Event", {
	sport: {
		type: String,
		required: true,
		minlegth: 1,
		trim: true,
	},
	date: {
		type: Date,
		required: true,
	},
	address: {
		type: String,
		required: true,
		minlegth: 1,
		trim: true,
	},
	skillLevel: {
		type: String,
		required: true,
		minlegth: 1,
		trim: true,
	},
	totalNumPeople: {
		type: Number,
		required: true,
	},
	joinedPeople: {
		type: [mongoose.Schema.Types.ObjectId],
		required: true,
	},
	description: {
		type: String,
		minlegth: 1,
		trim: true,
	},
	picture: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
});

module.exports = { Event };
