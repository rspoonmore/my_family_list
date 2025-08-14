const jwt = require('jsonwebtoken');

function getUserIDFromCookie(req) {
    // Read JWT cookie from header
    if(!req.headers.cookie) {
        return {
            success: false,
            message: 'No cookies were found in the header'
        }
    }
    let cookies = {}
    req.headers.cookie.split(';').forEach(pair => {
        if(pair.trim() != '') {
            const splitPair = pair.trim().split('=');
            if(splitPair.length === 2) {
                cookies[splitPair[0]] = splitPair[1];
            }
        }
    })
    if(!('jwt' in cookies)) {
        return {
            success: false,
            message: 'No JWT cookie was found'
        }
    }
    const token = cookies['jwt']
    const decodedToken = jwt.decode(token);
    // Get UserID from cookie
    const { userid } = decodedToken;
    if(!userid) {
        return {
            success: false,
            message: 'User was not found from the cookie of the request to create post'
        }
    }
    return {
        success: true,
        message: 'User found',
        userid: userid
    }
};

module.exports = {getUserIDFromCookie};
