const pool = require('../pool');
const {generateErrorJsonResponse} = require('../../errorJsonResGenerator');

module.exports.itemCreate = async ({membershipid=null, itemName=null, itemLink='', itemComments='', itemQtyReq=null, itemQtyPurch=0}) => {
    // Check that required fields are present
    if(!membershipid) {return generateErrorJsonResponse('membershipid was not provided')}
    if(!itemName) {return generateErrorJsonResponse('itemName was not provided')}
    if(!itemQtyReq) {return generateErrorJsonResponse('itemQtyReq was not provided')}

    // Create new item
    await pool.query(`
        INSERT INTO items (membershipid, itemName, itemLink, itemComments, itemQtyReq, itemQtyPurch, createDate, lastUpdateDate)
        VALUES ($1, $2, $3, $4, $5, $6, current_date, current_date);
        `, [Number(membershipid), itemName, itemLink, itemComments, Number(itemQtyReq), Number(itemQtyPurch)]);

    const { rows } = await pool.query(`
        SELECT itemid
            , membershipid
            , itemName
            , itemLink
            , itemComments
            , itemQtyReq
            , itemQtyPurch
            , TO_CHAR(createDate, 'YYYY-MM-DD') as createDate
            , TO_CHAR(lastUpdateDate, 'YYYY-MM-DD') as lastUpdateDate
        FROM items 
        WHERE membershipid = $1
            and itemName = $2
            and itemLink = $3
            and itemComments = $4
        ORDER BY itemid desc
        limit 1
        ;`, [Number(membershipid), itemName, itemLink, itemComments])
    
    return {
        'success': true,
        'message': 'item created',
        'item': rows[0] || null
    }
}

module.exports.itemGetByID = async ({itemid=null}) => {
    // Check that required fields are present
    if(!itemid) {return generateErrorJsonResponse('itemid was not provided')}

    const { rows } = await pool.query(`
        SELECT itemid
            , membershipid
            , itemName
            , itemLink
            , itemComments
            , itemQtyReq
            , itemQtyPurch
            , TO_CHAR(createDate, 'YYYY-MM-DD') as createDate
            , TO_CHAR(lastUpdateDate, 'YYYY-MM-DD') as lastUpdateDate
        FROM items 
        WHERE itemid = $1
        ORDER BY itemid desc
        LIMIT 1
        ;`, [Number(itemid)])

        if(!rows) {return null}
    
        return {
            'success': true,
            'message': 'item found',
            'item': rows[0] || null
        };
    
} 

module.exports.itemUpdate = async ({itemid=null, membershipid=null, itemName=null, itemLink='', itemComments='', itemQtyReq=null, itemQtyPurch=0}) => {
    // Check that required fields are present
    if(!itemid) {return generateErrorJsonResponse('itemid was not provided')}
    if(!membershipid) {return generateErrorJsonResponse('membershipid was not provided')}
    if(!itemName) {return generateErrorJsonResponse('itemName was not provided')}
    if(!itemQtyReq) {return generateErrorJsonResponse('itemQtyReq was not provided')}

    await pool.query(`
        UPDATE items 
        SET membershipid = $2
            , itemName = $3
            , itemLink = $4
            , itemComments = $5
            , itemQtyReq = $6
            , itemQtyPurch = $7
            , lastUpdateDate = CURRENT_DATE
        WHERE itemid = $1
        ;`, [Number(itemid), Number(membershipid), itemName, itemLink, itemComments, Number(itemQtyReq), Number(itemQtyPurch)])

    return {
        'success': true,
        'message': 'item updated'
    };
} 

module.exports.itemUpdateQtyPurchased = async ({itemid=null, itemQtyPurch=null}) => {
    // Check that required fields are present
    if(!itemid) {return generateErrorJsonResponse('itemid was not provided')}
    if(!itemQtyPurch & itemQtyPurch !== 0) {return generateErrorJsonResponse('itemQtyPurch was not provided')}

    await pool.query(`
        UPDATE items 
        SET itemQtyPurch = $2
            , lastUpdateDate = CURRENT_DATE
        WHERE itemid = $1
        ;`, [Number(itemid), Number(itemQtyPurch)])

    return {
        'success': true,
        'message': 'item updated'
    };
    
} 

module.exports.itemDelete = async ({itemid=null}) => {
    // Check that required fields are present
    if(!itemid) {return generateErrorJsonResponse('itemid was not provided')}

    await pool.query(`
        DELETE FROM items 
        WHERE itemid = $1
        ;`, [Number(itemid)])

    return {
        'success': true,
        'message': 'item deleted'
    };
    
} 