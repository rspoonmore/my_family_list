const userDB = require('../db/queries/userQueries');
const db = require('../db/queries/itemQueries');
const authenticator = require('../passport/authenticator');
const {generateErrorJsonResponse} = require('../errorJsonResGenerator');

async function isRealUser(req) {
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

        return true;
    } catch(error) {
        console.log(error)
        return generateErrorJsonResponse('Admin Check hit error');
    }
}

module.exports.itemCreate = async(req, res) => {
    const body = req.body;
    // Check that required fields are present
    if(!body?.membershipid) {return generateErrorJsonResponse('membershipid was not provided')}
    if(!body?.itemName) {return generateErrorJsonResponse('itemName was not provided')}
    if(!body?.itemQtyReq) {return generateErrorJsonResponse('itemQtyReq was not provided')}

    // Run real user check
    const userCheck = isRealUser(req);
    if(!userCheck) {return res.json(userCheck)}

    try {
        // create item
        const queryResults = await db.itemCreate(req.body);
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in itemCreate query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }

        return res.json({
            success: true,
            message: 'Item created!',
            'item': queryResults?.item || null
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`itemCreate hit error: ${error}`))
    }
}

module.exports.itemGetByID = async(req, res) => {
    // Check that required fields are present
    if(!req.params?.itemid) {return generateErrorJsonResponse('itemid was not provided')}
    
    // Run real user check
    const userCheck = isRealUser(req);
    if(!userCheck) {return res.json(userCheck)}

    try {
        // Get item
        const queryResults = await db.itemGetByID({itemid: Number(req.params.itemid)});
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in itemGetByID query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        return res.json({
            success: true,
            message: 'Item found!',
            item: queryResults.item || null
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`itemGetByID hit error: ${error}`))
    }
}

module.exports.itemUpdate = async(req, res) => {
    const params = req.params;
    const body = req.body;
    // Check that required fields are present
    if(!params?.itemid) {return generateErrorJsonResponse('itemid was not provided')}
    if(!body?.membershipid) {return generateErrorJsonResponse('membershipid was not provided')}
    if(!body?.itemName) {return generateErrorJsonResponse('itemName was not provided')}
    if(!body?.itemQtyReq) {return generateErrorJsonResponse('itemQtyReq was not provided')}

    // Run real user check
    const userCheck = isRealUser(req);
    if(!userCheck) {return res.json(userCheck)}

    try {
        // edit item
        const queryResults = await db.itemUpdate({ ...req.body, 'itemid': Number(params.itemid) });
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in itemUpdate query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }

        return res.json({
            success: true,
            message: 'Item Updated!'
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`itemUpdate hit error: ${error}`))
    }
}

module.exports.itemUpdateQtyPurchased = async(req, res) => {
    const params = req.params;
    const body = req.body;
    // Check that required fields are present
    if(!params?.itemid) {return generateErrorJsonResponse('itemid was not provided')}
    if(!body?.itemQtyPurch) {return generateErrorJsonResponse('itemQtyPurch was not provided')}

    // Run real user check
    const userCheck = isRealUser(req);
    if(!userCheck) {return res.json(userCheck)}

    try {
        // edit item
        const queryResults = await db.itemUpdateQtyPurchased({'itemid': Number(params.itemid), 'itemQtyPurch': Number(body.itemQtyPurch) });
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in itemUpdateQtyPurchased query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }

        return res.json({
            success: true,
            message: 'Item Qty Purchased Updated!'
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`itemUpdateQtyPurchased hit error: ${error}`))
    }
}

module.exports.itemDelete = async(req, res) => {
    // Check that required fields are present
    if(!req.params?.itemid) {return generateErrorJsonResponse('itemid was not provided')}
    
    // Run real user check
    const userCheck = isRealUser(req);
    if(!userCheck) {return res.json(userCheck)}

    try {
        // Get item
        const queryResults = await db.itemDelete({itemid: Number(req.params.itemid)});
        if(!queryResults) { return res.json(generateErrorJsonResponse('Failure in itemDelete query to return anyting.')) }
        if(!queryResults.success) {
            return res.json(generateErrorJsonResponse(queryResults.message))
        }
        return res.json({
            success: true,
            message: 'item deleted!'
        })
    } catch(error) {
        console.log(error)
        return res.json(generateErrorJsonResponse(`itemDelete hit error: ${error}`))
    }
}