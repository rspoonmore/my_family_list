const pool = require('../pool');
const {generateErrorJsonResponse} = require('../../errorJsonResGenerator');

module.exports.listCreate = async ({listName=null, eventDate=null}) => {
    // Check that required fields are present
    if(!listName) {return generateErrorJsonResponse('listName was not provided')}
    if(!eventDate) {return generateErrorJsonResponse('eventDate was not provided')}
    
    // Create new list
    await pool.query(`
        INSERT INTO lists (listName, eventDate)
        VALUES ($1, $2);
        `, [listName, eventDate]);

    return {
        'success': true,
        'message': 'list created'
    }
}

module.exports.listGet = async({listid=null, detailed=false}) => {
    if(!listid) {return generateErrorJsonResponse('listid was not provided')};

    let listQuery = '';
    if(detailed) {
        listQuery = `
        SELECT l.listid
            , l.listname
            , TO_CHAR(l.eventdate, 'YYYY-MM-DD') as eventDate
            , m.membershipid
            , m.userid
            , u.email
            , u.firstName
            , u.lastName
            , i.itemid
            , i.itemName
            , i.itemLink
            , i.itemComments
            , i.itemQtyReq
            , i.itemQtyPurch
            , i.createDate
            , i.lastUpdateDate
        FROM lists as l
        LEFT JOIN memberships as m
            ON l.listid = m.listid
        LEFT JOIN users as u
            on m.userid = u.userid
        LEFT JOIN items as i
            on m.membershipid = i.membershipid
        WHERE l.listid = $1
        ORDER BY l.listid
            , m.membershipid
            , i.itemid
        ;`
    } else {
        listQuery = `
        SELECT l.listid
            , l.listname
            , TO_CHAR(l.eventdate, 'YYYY-MM-DD') as eventDate
        FROM lists as l
        WHERE l.listid = $1
        ORDER BY l.listid
        ;`
    }

    console.log(listQuery);

    const { rows } = await pool.query(listQuery, [listid]);
    if(!rows) {return null}
    return {
        'success': true,
        'list': rows[0] || null
    };
}

module.exports.listGetAll = async ({detailed=false}) => {
    let listQuery = '';
    if(detailed) {
        listQuery = `
        SELECT l.listid
            , l.listname
            , TO_CHAR(l.eventdate, 'YYYY-MM-DD') as eventDate
            , m.membershipid
            , m.userid
            , u.email
            , u.firstName
            , u.lastName
            , i.itemid
            , i.itemName
            , i.itemLink
            , i.itemComments
            , i.itemQtyReq
            , i.itemQtyPurch
            , i.createDate
            , i.lastUpdateDate
        FROM lists as l
        LEFT JOIN memberships as m
            ON l.listid = m.listid
        LEFT JOIN users as u
            on m.userid = u.userid
        LEFT JOIN items as i
            on m.membershipid = i.membershipid
        ORDER BY l.listid
            , m.membershipid
            , i.itemid
        ;`
    } else {
        listQuery = `
        SELECT l.listid
            , l.listname
            , TO_CHAR(l.eventdate, 'YYYY-MM-DD') as eventDate
        FROM lists as l
        ORDER BY l.listid
        ;`
    }

    const { rows } = await pool.query(listQuery);
    if(!rows) {return null}
    return {
        'success': true,
        'lists': rows
    };
}

module.exports.listUpdate = async ({listid=null, listName=null, eventDate=null}) => {
    // Check that required fields are present
    if(!listid) {return generateErrorJsonResponse('listid was not provided')};
    if(!listName) {return generateErrorJsonResponse('listName was not provided')};
    if(!eventDate) {return generateErrorJsonResponse('eventDate was not provided')};
    
    // Update list
    await pool.query(`
        UPDATE lists
        SET listName = $1,
            eventDate = $2
        WHERE listid = $3;
        `, [listName, eventDate, listid]);

    return {
        'success': true,
        'message': 'list updated'
    }
};

module.exports.listDelete = async ({listid=null}) => {
    // Check that required fields are present
    if(!listid) {return generateErrorJsonResponse('listid was not provided')};

    // DELETE list
    await pool.query(`
        DELETE FROM lists 
        WHERE listid = $1;
        `, [listid])
}