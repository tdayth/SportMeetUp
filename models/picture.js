/* Student mongoose model */
const mongoose = require("mongoose");

const Picture = mongoose.model("Picture", {
	contentType: {
		require: true,
		type: String,
	},
	image: {
		required: true,
		type: Buffer,
	},
});

module.exports = { Picture };
