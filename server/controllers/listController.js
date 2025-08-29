const userDB = require('../db/queries/userQueries');
const db = require('../db/queries/listQueries');
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

module.exports.listCreate = async(req, res) => {
    const body = req.body;
    // Check that required fields are present
    if(!body?.listName) {return generateErrorJsonResponse('listName was not provided')}
    if(!body?.eventDate) {return generateErrorJsonResponse('eventDate was not provided')}

    const { listName, eventDate } = req.body;


    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // create list
        const queryResults = await db.listCreate({ listName, eventDate });
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in listCreate query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        return res.json({
            success: true,
            message: 'list created!'
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`listCreate hit error: ${error}`))
    }
}

module.exports.listGetAll = async (req, res) => {
    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // Get lists
        const queryResults = await db.listGetAll({detailed: req.query?.detailed === 'y'});
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in listGetAll query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        return res.json({
            success: true,
            message: 'Lists found!',
            lists: queryResults.lists || []
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`listGetAll hit error: ${error}`))
    }
}