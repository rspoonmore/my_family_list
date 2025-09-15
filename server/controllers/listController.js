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

        // retrieve created list
        const newListQueryResults = await db.listGetByName({ listName });
        if(!newListQueryResults) { return res.json(generateErrorJsonResponse('Failure in listGetByName query to return anyting.')) }
        if(!newListQueryResults.success) {
            return res.json(generateErrorJsonResponse(newListQueryResults.message))
        }

        return res.json({
            success: true,
            message: 'list created!',
            list: newListQueryResults?.list || null
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`listCreate hit error: ${error}`))
    }
}

module.exports.listGetAll = async (req, res) => {
    try {
        // set parameters
        let params = {'detailed': req.query?.detailed?.toLowerCase() === 'y'};
        if(!!req.query?.userid) {
            params['userid'] = Number(req.query.userid);
        }
        // Get lists
        const queryResults = await db.listGetAll(params);
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

module.exports.listGet = async (req, res) => {
    // Check that required fields are present
    if(!req.params?.listid) {return generateErrorJsonResponse('listid was not provided')}
    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}
    try {
        // Get list
        const queryResults = await db.listGet({listid: Number(req.params.listid), detailed: req.query?.detailed === 'y'});
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in listGet query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        return res.json({
            success: true,
            message: 'list found!',
            list: queryResults.list || []
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`listGet hit error: ${error}`))
    }
}

module.exports.listUpdate = async (req, res) => {
    const params = req.params;
    const body = req.body;
    // Check that required fields are present
    if(!params?.listid) {return generateErrorJsonResponse('listid was not provided')}
    if(!body?.listName) {return generateErrorJsonResponse('listName was not provided')}
    if(!body?.eventDate) {return generateErrorJsonResponse('eventDate was not provided')}

    const { listName, eventDate } = req.body;
    const { listid } = params;

    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // edit list
        const queryResults = await db.listUpdate({ listid, listName, eventDate });
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in listUpdate query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }

        // Get edited list
        const editedList = await db.listGet({listid});

        return res.json({
            success: true,
            message: 'List Updated!',
            editedList: editedList
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`listUpdate hit error: ${error}`))
    }
};

module.exports.listDelete = async (req, res) => {
    const params = req.params;
    // Check that required fields are present
    if(!params?.listid) {return generateErrorJsonResponse('listid was not provided')}
    const { listid } = params;

    // Run admin check
    const adminCheck = isUserAdmin(req);
    if(!adminCheck) {return res.json(adminCheck)}

    try {
        // delete list
        await db.listDelete({ listid });

        return res.json({
            success: true,
            message: 'List Deleted!'
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`listDelete hit error: ${error}`))
    }
}