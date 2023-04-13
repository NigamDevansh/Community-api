const { validateToken } = require("../services/authJWT");

function checkForAuthenticationCookie(cookieName) {
	return (req, res, next) => {
		const tokenCookieValue = req.cookies[cookieName];
		if (!tokenCookieValue) {
			return next();
		}

		try {
			const payload = validateToken(tokenCookieValue);
			req.user = payload;
			return next();
		} catch (error) {
			console.log("Invalid token!");
		}
		return next();
	};
}
module.exports = {
	checkForAuthenticationCookie,
};
