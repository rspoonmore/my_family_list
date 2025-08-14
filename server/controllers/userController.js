const db = require('../db/queries/userQueries');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const strategy = require('../passport/jwtStrategy');
const authenticator = require('../passport/authenticator');
const cookieOptions = require('../passport/cookieOptions');
const {generateErrorJsonResponse} = require('./errorJsonResGenerator');

passport.use('jwt', strategy);

async function userLogin(req, res) {
    const { email, password } = req.body;
    let user = null;
    // If email is provided, assume form submission
    if(email) {
        if(!password) {return res.json(generateErrorJsonResponse('Password provided was null'))};
        // Load user
        user = await db.userGetByEmail({email: email.toLowerCase()});
        if(!user) {return res.json(generateErrorJsonResponse(`User was not found for email ${email}`))};
        // Check that passwords match
        const match = await bcrypt.compare(password, user.password);
        if(!match) {return res.json(generateErrorJsonResponse(`The password entered was incorrect.`))};
        // Add JWT cookie
        const jwtToken = jwt.sign({ userid: user.userid }, process.env.PASSPORT_SESSION_SECRET);
        res.cookie('jwt', jwtToken, cookieOptions);
    }
    // Otherwise, assume loading from cookie
    else {
        const cookieSearchJson = authenticator.getUserIDFromCookie(req);
        // Check that cookie was loaded successfully
        if(!cookieSearchJson.success) {
            return res.json(generateErrorJsonResponse(cookieSearchJson.message))
        }
        if(!cookieSearchJson.userid) {return res.json(generateErrorJsonResponse(`User was not found from cookie`))}
        // Load user
        user = await db.userGetByID({userid: cookieSearchJson.userid});
    }
    if(!user) {return res.json(generateErrorJsonResponse(`User was not found.`))}
    return res.json({
        success: true,
        message: 'User logged in.',
        user: user
    })
}

async function userLogout(req, res) {
    res.clearCookie('jwt', cookieOptions);
    res.json({
        success: true,
        message: 'User logged out'
    })
}

async function userCreate(req, res) {
    try {
        // Load form submissions
        const { email, firstName, lastName, password, adminCode } = req.body;
        // check if admin code is valid
        const admin = adminCode && adminCode === process.env.ADMIN_CODE;
        // Hash password for storage
        const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));
        // Create user
        const createQueryResults = await db.userCreate({email, firstName, lastName, admin, password: hashedPassword});
        if(!createQueryResults) { return res.json(generateErrorJsonResponse('Failure in userCreate query to return anyting.')) }
        if(!createQueryResults.success) {
            return res.json(generateErrorJsonResponse(createQueryResults.message))
        }
        return res.json({
            success: true,
            message: 'User registered!'
        })
    } catch(error) {
        console.log(error)
    }
}

async function usersGetAll(req, res) {
    try {
        // Load admin status from cookie
        const cookieSearchJson = authenticator.getUserIDFromCookie(req);
        // Check that cookie was loaded successfully
        if(!cookieSearchJson.success) {
            return res.json(generateErrorJsonResponse(cookieSearchJson.message))
        };
        if(!cookieSearchJson.userid) {return res.json(generateErrorJsonResponse(`User was not found from cookie`))};
        // Load user
        reqUser = await db.userGetByID({userid: cookieSearchJson.userid});
        if(!reqUser) {return res.json(generateErrorJsonResponse(`User was not found.`))};
        // Check that user is admin
        if(!reqUser.admin) {return res.json(generateErrorJsonResponse('User is not an admin and does not have permissions'))}

        // Load users
        const users = await db.userGetAll();
        if(!users) {
            return res.json({
                success: true,
                message: 'No users created yet',
                users: []
            })
        }
        return res.json({
            success: true,
            message: 'Users found',
            users: users
        });
    } catch(error) {
        console.log(error)
    }
}

module.exports = {
    userLogin,
    userLogout,
    userCreate,
    usersGetAll
}