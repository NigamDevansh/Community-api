const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
async function connectToMongoDB(URL) {
	return await mongoose.connect(URL);
}

module.exports = {
	connectToMongoDB,
};
