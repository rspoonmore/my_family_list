const userDB = require('../db/queries/userQueries');
const db = require('../db/queries/membershipQueries');
const authenticator = require('../passport/authenticator');
const {generateErrorJsonResponse} = require('../errorJsonResGenerator');

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
        reqUser = await userDB.userGetByID({userid: cookieSearchJson.userid});
        if(!reqUser) {return generateErrorJsonResponse(`User was not found.`)};
        // Check that user is admin
        if(!reqUser.admin) {return generateErrorJsonResponse('User is not an admin and does not have permissions')}

        return true;
    } catch(error) {
        console.log(error)
        return generateErrorJsonResponse('Admin Check hit error');
    }
}


async function membershipCreate(req, res) {
    const { groupid, userid, startDate, endDate } = req.body;

    // Check that required fields are present
    if(!groupid) {return generateErrorJsonResponse('groupid was not provided')}
    if(!userid) {return generateErrorJsonResponse('userid was not provided')}
    if(!startDate) {return generateErrorJsonResponse('startDate was not provided')}
    if(!endDate) {return generateErrorJsonResponse('endDate was not provided')}

    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // create membership
        const queryResults = await db.membershipCreate({ groupid, userid, startDate, endDate });
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in membershipCreate query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        return res.json({
            success: true,
            message: 'membership created!'
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`membershipCreate hit error: ${error}`))
    }
}

async function membershipEdit(req, res) {
    const params = req.params;
    const membershipid = Number(params.membershipid);
    const { groupid, userid, startDate, endDate } = req.body;

    // Check that required fields are present
    if(!membershipid) {return generateErrorJsonResponse('membershipid was not provided')}
    if(!groupid) {return generateErrorJsonResponse('groupid was not provided')}
    if(!userid) {return generateErrorJsonResponse('userid was not provided')}
    if(!startDate) {return generateErrorJsonResponse('startDate was not provided')}
    if(!endDate) {return generateErrorJsonResponse('endDate was not provided')}

    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // edit membership
        const queryResults = await db.membershipEdit({ membershipid, groupid, userid, startDate, endDate });
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in membershipEdit query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }

        // Get edited membership
        const editedMembership = await db.membershipGet({membershipid});

        return res.json({
            success: true,
            message: 'Membership Edited!',
            membership: editedMembership
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`membershipEdit hit error: ${error}`))
    }
}

async function membershipGet(req, res) {
    const params = req.params;
    const membershipid = Number(params.membershipid);

    // Check that required fields are present
    if(!membershipid) {return generateErrorJsonResponse('membershipid was not provided')};

    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // Get membership
        const queryResults = await db.membershipGet({membershipid});
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in membershipGet query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        if(!queryResults.membership) {
            return res.json(generateErrorJsonResponse('No membership found in query results.'))
        }
        return res.json({
            success: true,
            message: 'Membership found!',
            membership: queryResults.membership
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`membershipGet hit error: ${error}`))
    }
}

async function membershipGetAll(req, res) {
    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // Get memberships
        const queryResults = await db.membershipGetAll();
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in membershipGetAll query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        return res.json({
            success: true,
            message: 'Groups found!',
            memberships: queryResults.memberships || []
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`membershipGetAll hit error: ${error}`))
    }
}

async function membershipDelete(req, res) {
    const params = req.params;
    const membershipid = Number(params.membershipid);

    // Check that required fields are present
    if(!membershipid) {return generateErrorJsonResponse('membershipid was not provided')};

    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // Delete membership
        const queryResults = await db.membershipDelete({membershipid});
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in membershipDelete query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        return res.json({
            success: true,
            message: 'Membership deleted!'
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`membershipDeletehit error: ${error}`))
    }
}

module.exports = {
    membershipCreate,
    membershipEdit,
    membershipGet,
    membershipGetAll,
    membershipDelete
}