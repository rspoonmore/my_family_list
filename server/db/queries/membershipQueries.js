const pool = require('../pool');
const {generateErrorJsonResponse} = require('../../errorJsonResGenerator');

async function membershipCreate({groupid = null, userid = null, startDate = null, endDate = null}) {
    // Check that required fields are present
    if(!groupid) {return generateErrorJsonResponse('groupid was not provided')}
    if(!userid) {return generateErrorJsonResponse('userid was not provided')}
    if(!startDate) {return generateErrorJsonResponse('startDate was not provided')}
    if(!endDate) {return generateErrorJsonResponse('endDate was not provided')}
    
    // Create new membership
    await pool.query(`
        INSERT INTO memberships (groupid, userid, startDate, endDate)
        VALUES ($1, $2, $3, $4)
        ;`, [groupid, userid, startDate, endDate]);

    return {
        'success': true,
        'message': 'Membership created'
    }
}

async function membershipGetAll() {
    const { rows } = await pool.query(`
        SELECT m.membershipid
            , m.groupid 
            , g.groupname
            , m.userid
            , u.email
            , TO_CHAR(m.startdate, 'YYYY-MM-DD') as startDate
            , TO_CHAR(m.enddate, 'YYYY-MM-DD') as endDate
        FROM memberships as m
        LEFT JOIN groups as g
            ON m.groupid = g.groupid
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
            , m.groupid 
            , g.groupname
            , m.userid
            , u.email
            , TO_CHAR(m.startdate, 'YYYY-MM-DD') as startDate
            , TO_CHAR(m.enddate, 'YYYY-MM-DD') as endDate
        FROM memberships as m
        LEFT JOIN groups as g
            ON m.groupid = g.groupid
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

async function membershipEdit({membershipid = null, groupid = null, userid = null, startDate = null, endDate = null}) {
    // Check that required fields are present
    if(!membershipid) {return generateErrorJsonResponse('membershipid was not provided')}
    if(!groupid) {return generateErrorJsonResponse('groupid was not provided')}
    if(!userid) {return generateErrorJsonResponse('userid was not provided')}
    if(!startDate) {return generateErrorJsonResponse('startDate was not provided')}
    if(!endDate) {return generateErrorJsonResponse('endDate was not provided')}

    // Update group
    await pool.query(`
        UPDATE memberships 
        SET groupid = $1,
            userid = $2,
            startDate = $3,
            endDate = $4
        WHERE membershipid = $5
        ;`, [groupid, userid, startDate, endDate, membershipid]);
    
    return {
        'success': true,
        'message': 'membership updated',
    }
}

async function membershipDelete({membershipid = null}) {
    // Check that required fields are present
    if(!membershipid) {return generateErrorJsonResponse('membershipid was not provided')}

    // Delete membership
    await pool.query(`DELETE FROM memberships WHERE membershipid = $1;`, [membershipid]);
    
    return {
        'success': true,
        'message': 'Membership deleted',
    }
}

module.exports = {
    membershipCreate,
    membershipEdit,
    membershipGet,
    membershipGetAll,
    membershipDelete
}