import { useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell'

const ChangePasswordView = () => {
    const blankFormData = {'oldPassword': '', 'newPassword': '', 'confirmPassword': ''}
    const [updateAllowed, setUpdateAllowed] = useState(true);
    const { userid } = useParams();
    const [formData, setFormData] = useState(blankFormData);
    const [outcome, setOutcome] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;
    const { currentUser } = useContext(AuthContext);

    // Show outcome of PUT
    const updateErrors = () => {
        if(!outcome) {return <></>}
        if(!outcome.message) {return <></>}
        const className = outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{outcome.message}</div>
    }

    // Update any entries in the form
    const updateFormData = (stateKey, e) => {
        const newVal = (e === null) ? '' : e;
        setFormData(prev => {
            const copy = {...prev};
            copy[stateKey] = newVal;
            return copy
        })
    }

    // Reset the form once submitted
    const clearInputs = () => {
        setFormData(blankFormData);
    }

    const updatePassword = async (e) => {
        e.preventDefault();
        console.log('Updating Password');
        try {
            // Save form data in body of request
            const data = new FormData();
            for(const key in formData) {
                data[key] = formData[key];
            }

            // Check that passwords match
            if(formData.newPassword !== formData.confirmPassword) {
                setOutcome({
                    'success': false,
                    'message': 'The new password has to be the same as the confirmed password.'
                })
                return;
            }

            // Check that passwords are different
            if(formData.newPassword === formData.oldPassword) {
                setOutcome({
                    'success': false,
                    'message': 'The new password has to be different from the old password.'
                })
            }
            
            // Put user password
            console.log(data);
            await fetch(`${apiUrl}/users/${Number(userid)}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                console.log(res)
                // update successful
                if(res.success) {
                    setOutcome(res);
                    clearInputs();
                }
                // update was not successful
                else {
                    setOutcome(res);
                }
            })
        } catch(error) {
            console.log(error)
        }
    }

    // Check if edit is allowed
    const loadForm = () => {
        console.log('Loading Form');
        // Check that current user exists
        if(!currentUser) {
            setUpdateAllowed(false)
            return;
        }
        // Check that current user is allowed to make the update
        if(!currentUser.admin && currentUser.userid !== userid) {
            setUpdateAllowed(false);
            return;
        }
    }

    // Load form
    useEffect(loadForm, [currentUser])

    // Generate password update view
    function generateView() {
        // Check if update is allowed 
        if(!updateAllowed) {return <div>You do not have permission to change the password for this user</div>}
        
        // return view
        return (
            <div className='standard-form-container'>
                <h1>Change Password</h1>
                {updateErrors()}
                <form className='standard-form' onSubmit={updatePassword}>
                    <label htmlFor='oldPassword'>Old Password</label>
                    <input 
                        id='oldPassword' 
                        name='oldPassword' 
                        type='password' 
                        value={formData['oldPassword']}
                        onChange={(e) => {updateFormData('oldPassword', e.target.value)}}
                    required/>
                    <label htmlFor='newPassword'>New Password</label>
                    <input 
                        id='newPassword' 
                        name='newPassword' 
                        type='password' 
                        value={formData['newPassword']}
                        onChange={(e) => {updateFormData('newPassword', e.target.value)}}
                    required/>
                    <label htmlFor='confirmPassword'>Confirm Password</label>
                    <input 
                        id='confirmPassword' 
                        name='confirmPassword' 
                        type='password' 
                        value={formData['confirmPassword']}
                        onChange={(e) => {updateFormData('confirmPassword', e.target.value)}}
                    required/>
                    <div className='standard-form-btns'>
                        <button className='btn' type='button' onClick={clearInputs}>Clear</button>
                        <button className='btn' type='submit'>Update</button>
                    </div>
                </form>
            </div>
        )
    }

    return generateView();
}

const ChangePassword = () => {
    return <PageShell mainView={ChangePasswordView} />
}

export default ChangePassword