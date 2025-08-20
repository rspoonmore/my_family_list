import { useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell'

const UpdateUserView = () => {
    const blankFormData = {'email': '', 'firstName': '', 'lastName': '', 'adminCode': null}
    const startingState = {
        'formData': blankFormData,
        'outcome': null,
        'showAdminCode': false
    }
    const [updateAllowed, setUpdateAllowed] = useState(true);
    const { userid } = useParams();
    const [state, setState] = useState(startingState);
    const apiUrl = import.meta.env.VITE_API_URL;
    const { currentUser } = useContext(AuthContext)

    // Show outcome of PUT
    const updateErrors = () => {
        if(!state.outcome) {return <></>}
        if(!state.outcome.message) {return <></>}
        const className = state.outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{state.outcome.message}</div>
    }

    // Update any entries in the form
    const updateFormData = (key, e) => {
        const newVal = (e === null) ? '' : e
        setState(prev => {
            let copy = {...prev}
            copy['formData'][key] = newVal;
            return copy
        })
    }

    // Update the state when the admin box is checked or unchecked
    const setShowAdminCode = (e) => {
        setState(prev => ({
            ...prev,
            showAdminCode: e.target.checked === true
        }))
    }

    // Update the outcome in the state
    const setOutcome = (o) => {
        setState(prev => ({
            ...prev,
            outcome: o
        }))
    }

    // Reset the form once submitted
    const clearInputs = () => {
        setState(startingState);
    }

    // Populate form with user data
    const populateForm = (user) => {
        updateFormData('email', user.email)
        updateFormData('firstName', user.firstname)
        updateFormData('lastName', user.lastname)
    }

    // Handle showing or hiding the admin code input
    const adminCodeInput = () => {
        if(!state.showAdminCode) {return <></>}
        return (
            <>
            <label htmlFor='update-admin-code'>Admin Code</label>
            <input 
                id='update-admin-code' 
                name='adminCode' 
                type='password' 
                value={state.formData['adminCode'] ? state.formData['adminCode'] : ''}
                onChange={(e) => {updateFormData('adminCode', e.target.value)}}
            required/>
            </>
        )
    }

    // Function called when user is updated
    const updateUser = async (e) => {
        e.preventDefault();
        console.log('Updating User');
        try {
            // Save form data in body of request
            const data = new FormData();
            for(const key in state.formData) {
                data[key] = state.formData[key];
            }
            
            // Put user
            console.log(data);
            await fetch(`${apiUrl}/users/${Number(userid)}`, {
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
                    if(res.user) {populateForm(res.user)};
                }
                // update was not successful
                else {
                    setOutcome(res);
                }
            })
        } catch(error) {
            console.log(error);
        }
    }

    // Load user and populate form
    const loadForm = () => {
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
        console.log('Loading User');
        try {
            // Request user details
            fetch(`${apiUrl}/users/${Number(userid)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            .then(res => res.json())
            .then(res => {
                console.log(res)
                // user found
                if(res.success) {
                    if(res.user) {populateForm(res.user)};
                }
                // user not found
                else {
                    setOutcome(res);
                }
            })
        } catch(error) {
            console.log(error);
        }
    }

    // Load User
    useEffect(loadForm, [currentUser])

    // Generate View
    function generateView() {
        // Check if update is allowed 
        if(!updateAllowed) {return <div>You do not have permission to update this user</div>}
        
        // return view
        return (
            <div className='standard-form-container'>
                <h1>Update User</h1>
                {updateErrors()}
                <form className='standard-form' onSubmit={updateUser}>
                    <label htmlFor='update-email'>Email Address</label>
                    <input 
                        id='update-email' 
                        name='email' 
                        type='email' 
                        value={state.formData['email']}
                        onChange={(e) => {updateFormData('email', e.target.value)}}
                    required/>
                    <label htmlFor='update-firstName'>First Name</label>
                    <input 
                        id='update-firstName' 
                        name='firstName' 
                        type='firstName' 
                        value={state.formData['firstName']}
                        onChange={(e) => {updateFormData('firstName', e.target.value)}}
                    />
                    <label htmlFor='update-lastName'>Last Name</label>
                    <input 
                        id='update-lastName' 
                        name='lastName' 
                        type='lastName' 
                        value={state.formData['lastName']}
                        onChange={(e) => {updateFormData('lastName', e.target.value)}}
                    />
                    <label htmlFor='show-admin'>Admin Account?</label>
                    <input 
                        id='show-admin'
                        type='checkbox'
                        checked={state.showAdminCode}
                        onChange={(e) => {setShowAdminCode(e)}} 
                    />
                    {adminCodeInput()}
                    <div className='standard-form-btns'>
                        <button className='btn' type='button' onClick={clearInputs}>Clear</button>
                        <button className='btn' type='submit'>Update</button>
                    </div>
                </form>
            </div>
        )
    }
    
    return generateView()
}

const UpdateUser = () => {
    return <PageShell mainView={UpdateUserView} />
}

export default UpdateUser