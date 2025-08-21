const userDB = require('../db/queries/userQueries');
const db = require('../db/queries/groupQueries');
const authenticator = require('../passport/authenticator');
const {generateErrorJsonResponse} = require('./errorJsonResGenerator');
const { query } = require('../db/pool');

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


async function groupCreate(req, res) {
    const { groupName } = req.body;

    // Check for required fields
    if(!groupName) {return res.json(generateErrorJsonResponse('No groupName was found in the request parameters'))}

    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // create group
        const createQueryResults = await db.groupCreate({groupName});
        if(!createQueryResults) { return res.json(generateErrorJsonResponse('Failure in groupCreate query to return anyting.')) }
        if(!createQueryResults.success) {
            return res.json(generateErrorJsonResponse(createQueryResults.message))
        }
        return res.json({
            success: true,
            message: 'Group created!'
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`Create group hit error: ${error}`))
    }
}

async function groupEdit(req, res) {
    const params = req.params;
    const groupid = Number(params.groupid);
    const { groupName } = req.body;

    // Check for required fields
    if(!groupName) {return res.json(generateErrorJsonResponse('No groupName was found in the request parameters'))};
    if(!groupid) {return res.json(generateErrorJsonResponse('No groupid was found in the request parameters'))};

    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // edit group
        const queryResults = await db.groupEdit({groupid, groupName});
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in groupEdit query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        return res.json({
            success: true,
            message: 'Group Edited!'
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`Edit group hit error: ${error}`))
    }
}

async function groupGet(req, res) {
    const params = req.params;
    const groupid = Number(params.groupid);

    // Check for required fields
    if(!groupid) {return res.json(generateErrorJsonResponse('No groupid was found in the request parameters'))};

    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // Get group
        const queryResults = await db.groupGet({groupid});
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in groupGet query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        if(!queryResults.group) {
            return res.json(generateErrorJsonResponse('No group found in query results.'))
        }
        return res.json({
            success: true,
            message: 'Group found!',
            group: queryResults.group
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`Get group hit error: ${error}`))
    }
}

async function groupGetAll(req, res) {
    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // Get groups
        const queryResults = await db.groupGetAll();
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in groupGetAll query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        return res.json({
            success: true,
            message: 'Groups found!',
            groups: queryResults.groups ? queryResults.groups : []
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`Get all group hit error: ${error}`))
    }
}

async function groupDelete(req, res) {
    const params = req.params;
    const groupid = Number(params.groupid);

    // Check for required fields
    if(!groupid) {return res.json(generateErrorJsonResponse('No groupid was found in the request parameters'))};

    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // Delete group
        const queryResults = await db.groupDelete({groupid});
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in groupDelete query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        return res.json({
            success: true,
            message: 'Group deleted!'
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`Delete group hit error: ${error}`))
    }
}

module.exports = {
    groupCreate,
    groupEdit,
    groupGet,
    groupGetAll,
    groupDelete
}