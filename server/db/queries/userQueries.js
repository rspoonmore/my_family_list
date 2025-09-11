const pool = require('../pool');

async function userGetByID({userid = null}) {
    if(!userid) {return null}
    const { rows } = await pool.query(`SELECT * FROM users WHERE userid = $1;`, [userid]);
    if(!rows) {return null}
    return rows.length > 0 ? rows[0] : null;
}

async function userGetByEmail({email = null}) {
    if(!email) {return null}
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1;`, [email.toLowerCase()]);
    if(!rows) {return null}
    return rows.length > 0 ? rows[0] : null;
}

async function userGetAll() {
    const { rows } = await pool.query(`SELECT * FROM users ORDER BY userid;`);
    if(!rows) {return null}
    return rows;
}

async function userCreate({email=null, firstName=null, lastName=null, admin=false, password=null}) {
    // Check that required fields are present
    if(!email) {
        return {
            'success': false,
            'message': 'Email was submitted as null'
        }
    }
    if(!password) {
        return {
            'success': false,
            'message': 'Password was submitted as null'
        }
    }

    // Check that user does not already exist
    existingUser = await userGetByEmail({email: email.toLowerCase()});
    if(existingUser) {
        return {
            'success': false,
            'message': 'User already exists'
        }
    }

    // Create new user
    await pool.query(`
        INSERT INTO users (email, firstName, lastName, admin, password)
        VALUES ($1, $2, $3, $4, $5)
        ;`, [email.toLowerCase(), firstName, lastName, admin, password]);

    return {
        'success': true,
        'message': 'User created'
    }
}

async function userUpdateDemographics({userid=null, email=null, firstName=null, lastName=null, admin=false}) {
    // Check that required fields are present
    if(!userid) {
        return {
            'success': false,
            'message': 'Userid was submitted as null'
        }
    }

    // Update user
    await pool.query(`
        UPDATE users 
        SET email = $1
            , firstName = $2
            , lastName = $3
            , admin = $4
        WHERE userid = $5
        ;`, [email.toLowerCase(), firstName, lastName, admin, userid]);
    
    return {
        'success': true,
        'message': 'User updated',
    }
}

async function userUpdatePassword({userid=null, password=null}) {
    // Check that required fields are present
    if(!userid) {
        return {
            'success': false,
            'message': 'Userid was submitted as null'
        }
    }
    if(!password) {
        return {
            'success': false,
            'message': 'Password was submitted as null'
        }
    }

    // Update user
    await pool.query(`
        UPDATE users 
        SET password = $1
        WHERE userid = $2
        ;`, [password, userid]);

    return {
        'success': true,
        'message': 'User password updated',
    }
}

async function userDelete({userid=null, deep=true}) {
    // Check that required fields are present
    if(!userid) {
        return {
            'success': false,
            'message': 'Userid was submitted as null'
        }
    }

    // Delete from users table
    await pool.query(`DELETE FROM users where userid = $1;`, [userid]);

    // Waterfall delete if deep is true
    if(deep) {
        // Memberhsips
        await pool.query(`DELETE FROM memberships where userid = $1;`, [userid]);
    }
    return {
        'success': true,
        'message': 'User deleted'
    }
}

module.exports = {
    userGetByID,
    userGetByEmail,
    userGetAll,
    userCreate,
    userUpdateDemographics,
    userUpdatePassword,
    userDelete
}