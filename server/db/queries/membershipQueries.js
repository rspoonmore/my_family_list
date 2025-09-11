const pool = require('../pool');
const {generateErrorJsonResponse} = require('../../errorJsonResGenerator');

async function membershipCreate({listid=null, userid=null}) {
    // Check that required fields are present
    if(!listid) {return generateErrorJsonResponse('listid was not provided')};
    if(!userid) {return generateErrorJsonResponse('userid was not provided')};
    
    // Create new membership
    await pool.query(`
        INSERT INTO memberships (listid, userid)
        VALUES ($1, $2)
        ;`, [listid, userid]);

    return {
        'success': true,
        'message': 'Membership created'
    }
}

async function membershipGetAll() {
    const { rows } = await pool.query(`
        SELECT m.membershipid
            , m.listid 
            , l.listName
            , m.userid
            , u.email
            , u.firstName
            , u.lastName
        FROM memberships as m
        LEFT JOIN lists as l
            on m.listid = l.listid
        LEFT JOIN users as u
            ON m.userid = u.userid
        ORDER BY m.membershipid;`);
    if(!rows) {return null}
    return {
        'success': true,
        'memberships': rows
    };
}

async function membershipGet({membershipid = null}) {
    // Check that required fields are present
    if(!membershipid) {return generateErrorJsonResponse('membershipid was not provided')}

    // Return 1 membership
    const { rows } = await pool.query(`
        SELECT m.membershipid
            , m.listid 
            , l.listName
            , m.userid
            , u.email
            , u.firstName
            , u.lastName
        FROM memberships as m
        LEFT JOIN lists as l
            on m.listid = l.listid
        LEFT JOIN users as u
            ON m.userid = u.userid
        WHERE m.membershipid = $1 
        ORDER BY m.membershipid LIMIT 1
        ;`, [membershipid]);
    if(!rows) {return null}
    return {
        'success': true,
        'membership': rows.length > 0 ? rows[0] : null
    };
}

async function membershipDelete({membershipid = null, deep = true}) {
    // Check that required fields are present
    if(!membershipid) {return generateErrorJsonResponse('membershipid was not provided')}

    // Delete membership
    await pool.query(`DELETE FROM memberships WHERE membershipid = $1;`, [membershipid]);

    if(deep) {
        await pool.query(`DELETE FROM items WHERE membershipid = $1;`, [membershipid]);
    }
    
    return {
        'success': true,
        'message': 'Membership deleted',
    }
}

module.exports = {
    membershipCreate,
    membershipGet,
    membershipGetAll,
    membershipDelete
}