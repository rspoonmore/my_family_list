exports.cookieOptions = {
	maxAge: 1000 * 60 * 60 * 24 * 30,
	httpOnly: false,
	secure: true,
	// sameSite: 'none',
	SameSite: "None"
    // 'Access-Control-Allow-Credentials': true
};