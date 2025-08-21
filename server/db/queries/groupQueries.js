const pool = require('../pool');

async function groupCreate({groupName = null}) {
    // Check that required fields are present
    if(!groupName) {
        return {
            'success': false,
            'message': 'groupName was submitted as null'
        }
    }
    
    // Create new group
    await pool.query(`
        INSERT INTO groups (groupName)
        VALUES ($1)
        ;`, [groupName]);

    return {
        'success': true,
        'message': 'Group created'
    }
}

async function groupGetAll() {
    const { rows } = await pool.query(`SELECT * FROM groups ORDER BY groupid;`);
    if(!rows) {return null}
    return {
        'success': true,
        'groups': rows
    };
}

async function groupGet({groupid = null}) {
    // Check that required fields are present
    if(!groupid) {
        return {
            'success': false,
            'message': 'groupid was submitted as null'
        }
    }

    // Return 1 group
    const { rows } = await pool.query(`SELECT * FROM groups where groupid = $1 ORDER BY groupid;`, [groupid]);
    if(!rows) {return null}
    return {
        'success': true,
        'group': rows.length > 0 ? rows[0] : null
    };
}

async function groupEdit({groupid = null, groupName = null}) {
    // Check that required fields are present
    if(!groupid) {
        return {
            'success': false,
            'message': 'groupid was submitted as null'
        }
    }
    if(!groupName) {
        return {
            'success': false,
            'message': 'groupName was submitted as null'
        }
    }

    // Update group
    await pool.query(`
        UPDATE groups 
        SET groupName = $1
        WHERE groupid = $2
        ;`, [groupName, groupid]);
    
    return {
        'success': true,
        'message': 'Group updated',
    }
}

async function groupDelete({groupid = null, deep = false}) {
    // Check that required fields are present
    if(!groupid) {
        return {
            'success': false,
            'message': 'groupid was submitted as null'
        }
    }

    // Delete group
    await pool.query(`DELETE FROM groups WHERE groupid = $1;`, [groupid]);

    // Deep delete
    if(deep){
        await pool.query(`DELETE FROM memberships WHERE groupid = $1;`, [groupid]);
        await pool.query(`DELETE FROM lists WHERE groupid = $1;`, [groupid]);
    }
    
    return {
        'success': true,
        'message': 'Group deleted',
    }
}

module.exports = {
    groupCreate,
    groupEdit,
    groupGet,
    groupGetAll,
    groupDelete
}