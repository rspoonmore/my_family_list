exports.cookieOptions = {
	expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
	httpOnly: false,
	secure: false,
	// sameSite: 'none',
    // 'Access-Control-Allow-Credentials': true
};