exports.cookieOptions = {
	maxAge: 1000 * 60 * 60 * 24 * 30,
	httpOnly: false,
	secure: true,
	sameSite: 'None'
    // 'Access-Control-Allow-Credentials': true
};