const db = require('../db/queries/userQueries');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const strategy = require('../passport/jwtStrategy');
const authenticator = require('../passport/authenticator');
const cookieOptions = require('../passport/cookieOptions');
const {generateErrorJsonResponse} = require('../errorJsonResGenerator');

passport.use('jwt', strategy);

async function isUserAdmin(req) {
    try {
        // Load admin status from cookie
        const cookieSearchJson = authenticator.getUserIDFromCookie(req);
        // Check that cookie was loaded successfully
        if(!cookieSearchJson.success) {
            return generateErrorJsonResponse(cookieSearchJson.message)
        };
        if(!cookieSearchJson.userid) {return generateErrorJsonResponse(`User was not found from cookie`)};
        // Load user
        reqUser = await db.userGetByID({userid: Number(cookieSearchJson.userid)});
        if(!reqUser) {return generateErrorJsonResponse(`User was not found.`)};
        // Check that user is admin
        if(!reqUser.admin) {return generateErrorJsonResponse('User is not an admin and does not have permissions')}

        return true;
    } catch(error) {
        console.log(error)
        return generateErrorJsonResponse('Admin Check hit error');
    }
}

async function isAdminOrRequesting(req, targetUserID) {
    // Load admin status from cookie
    const cookieSearchJson = authenticator.getUserIDFromCookie(req);
    // Check that cookie was loaded successfully
    if(!cookieSearchJson.success) {
        return generateErrorJsonResponse(cookieSearchJson.message)
    };
    if(!cookieSearchJson.userid) {return generateErrorJsonResponse(`User was not found from cookie`)};
    // Load user
    reqUser = await db.userGetByID({userid: Number(cookieSearchJson.userid)});
    if(!reqUser) {return generateErrorJsonResponse(`User was not found.`)};

    // If admin return True
    if(reqUser?.admin) {
        return {'reqAllowed': true, 'requestType': 'admin'};
    }

    // If requesting user matches target user return True
    if(Number(reqUser?.userid) === Number(targetUserID)) {
        return {'reqAllowed': true, 'requestType': 'target'};
    }

    return {'reqAllowed': false, 'requestType': 'other'};
}

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
        res.cookie('jwt', jwtToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
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
    res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }
    );
    res.json({
        success: true,
        message: 'User logged out'
    })
}

async function userSession(req, res) {
    try {
        // Authenticator should read the httpOnly cookie automatically
        const cookieSearchJson = authenticator.getUserIDFromCookie(req);
        
        if (!cookieSearchJson.success) {
            // Cookie is missing, expired, or invalid
            return res.json({ success: false, message: 'No valid session token.' });
        }

        // Load user data from the database using the ID from the validated cookie
        const user = await db.userGetByID({ userid: Number(cookieSearchJson.userid) });
        
        if (!user) {
            return res.json({ success: false, message: 'User not found.' });
        }

        // Return user data, confirming success
        return res.json({ success: true, user: user });
    } catch(error) {
        console.log(error);
        return res.json(generateErrorJsonResponse('Session check failed.'));
    }
}

async function userCreate(req, res) {
    try {
        // Load form submissions
        const { email, firstName, lastName, password, adminCode } = req.body;
        // check if admin code is valid
        const admin = (adminCode && adminCode === process.env.ADMIN_CODE) === true;
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
        // Run admin check
        const adminCheck = isUserAdmin(req);
        if(!adminCheck) {return res.json(adminCheck)}

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

async function userUpdate(req, res) {
    try {
        const params = req.params;
        const userid = Number(params.userid);
        const { email, firstName, lastName, adminCode } = req.body;
        const admin = adminCode === process.env.ADMIN_CODE;

        // Check for required fields
        if(!userid) {return res.json(generateErrorJsonResponse('No userid was found in the request parameters'))}
        if(!email) {return res.json(generateErrorJsonResponse('No email was found in the request body'))}

        // Check if user exists
        const existingUser = await db.userGetByID({userid});
        if(!existingUser) {return res.json(generateErrorJsonResponse(`User with userid ${userid} does not exist.`))}

        // Confirm that requesting user is the same or an admin
        const {reqAllowed} = await isAdminOrRequesting(req, existingUser?.userid);
        if(!reqAllowed) {return res.json(generateErrorJsonResponse("The user requesting the update is not an admin and does not match the user being updated"))}

        // Update the user
        const updateResponse = await db.userUpdateDemographics({userid, email, firstName, lastName, admin})

        // Handle update errors
        if(!updateResponse) {return res.json(generateErrorJsonResponse("Issue with the update query"))}
        if(!updateResponse.message) {return res.json(generateErrorJsonResponse("No Update Response Message Found"))}
        if(!updateResponse.success) {return res.json(generateErrorJsonResponse(updateResponse.message))}

        // Get user to return
        const updatedUser = await db.userGetByID({userid});

        // Return Success
        return res.json({
            ...updateResponse,
            user: updatedUser
        })

    } catch (error) {
        console.log(error)
    }
}

async function userGetByID(req, res) {
    try {
        const params = req.params;
        const userid = Number(params.userid);

        // Check for required fields
        if(!userid) {return res.json(generateErrorJsonResponse('No userid was found in the request parameters'))}

        // Load users
        const user = await db.userGetByID({userid});
        if(!user) {return res.json(generateErrorJsonResponse(`No user with userid ${userid} was found`))}
        return res.json({
            success: true,
            message: 'User found',
            user: user
        });
    } catch(error) {
        console.log(error)
    }
}

async function userUpdatePassword(req, res) {
    try {
        const params = req.params;
        const userid = Number(params.userid);
        

        // Check for required fields
        if(!userid) {return res.json(generateErrorJsonResponse('No userid was found in the request parameters'))}
        if(!req.body?.newPassword) {return res.json(generateErrorJsonResponse('No New Password Entered'))}
        if(!req.body?.confirmPassword) {return res.json(generateErrorJsonResponse('No Confirmed Password Entered'))}
        if(req.body?.newPassword !== req.body?.confirmPassword) {return res.json(generateErrorJsonResponse('New Passwords Do Not Match'))}

        // Check if user exists
        const existingUser = await db.userGetByID({userid});
        if(!existingUser) {return res.json(generateErrorJsonResponse(`User with userid ${userid} does not exist.`))}

        // Confirm that requesting user is the same or an admin
        const {reqAllowed, requestType} = await isAdminOrRequesting(req, existingUser?.userid);
        if(!reqAllowed) {return res.json(generateErrorJsonResponse("The user requesting the update is not an admin and does not match the user being updated"))}

        // Check that passwords match if not an Admin
        if(requestType !== 'admin') {
            if(!req.body?.oldPassword) {return res.json(generateErrorJsonResponse('No Old Password Entered'))}
            const match = await bcrypt.compare(req.body?.oldPassword, existingUser.password);
            if(!match) {return res.json(generateErrorJsonResponse(`The password entered was incorrect.`))};
        }

        // Hash password for storage
        const hashedPassword = await bcrypt.hash(req.body?.newPassword, Number(process.env.BCRYPT_SALT));

        // Update the user
        const updateResponse = await db.userUpdatePassword({userid, password: hashedPassword});

        // Handle update errors
        if(!updateResponse) {return res.json(generateErrorJsonResponse("Issue with the update query"))};
        if(!updateResponse.message) {return res.json(generateErrorJsonResponse("No Update Response Message Found"))};
        if(!updateResponse.success) {return res.json(generateErrorJsonResponse(updateResponse.message))};

        // Return Success
        return res.json(updateResponse);
        

    } catch(error) {
        console.log(error)
    }
}

async function userDelete(req, res) {
    try {
        const params = req.params;
        const userid = Number(params.userid);
        // Check for required fields
        if(!userid) {return res.json(generateErrorJsonResponse('No userid was found in the request parameters'))}

        // Confirm that requesting user is the same or an admin
        const {reqAllowed} = await isAdminOrRequesting(req, existingUser?.userid);
        if(!reqAllowed) {return res.json(generateErrorJsonResponse("The user requesting the update is not an admin and does not match the user being updated"))}

        // Delete the user
        const deleteResponse = await db.userDelete({userid, deep: true});

        // Handle update errors
        if(!deleteResponse) {return res.json(generateErrorJsonResponse("Issue with the delete query"))};
        if(!deleteResponse.message) {return res.json(generateErrorJsonResponse("No Delete Response Message Found"))};
        if(!deleteResponse.success) {return res.json(generateErrorJsonResponse(deleteResponse.message))};

        // Return Success
        return res.json(deleteResponse);
    } catch(error) {
        console.log(error)
    }
}

module.exports = {
    userLogin,
    userLogout,
    userCreate,
    usersGetAll,
    userGetByID,
    userUpdate,
    userUpdatePassword,
    userDelete,
    userSession
}