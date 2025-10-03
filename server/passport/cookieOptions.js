exports.cookieOptions = {
	maxAge: 1000 * 60 * 60 * 24 * 30,
	httpOnly: true,
	secure: true,
	sameSite: 'none'
    // 'Access-Control-Allow-Credentials': true
};