import { useContext, useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell'

const UpdateUserView = () => {
    const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
    const labelClass = 'block text-sm font-medium text-gray-700';

    const blankFormData = {'email': '', 'firstName': '', 'lastName': '', 'adminCode': null}
    const startingState = {
        'formData': blankFormData,
        'outcome': null,
        'showAdminCode': false
    }
    const location = useLocation();
    const [updateAllowed, setUpdateAllowed] = useState(true);
    const [userLoaded, setUserLoaded] = useState(false);
    const { userid } = useParams();
    const [state, setState] = useState(startingState);
    const apiUrl = import.meta.env.VITE_API_URL;
    const { currentUser, setCurrentUser } = useContext(AuthContext)

    // Show outcome of PUT
    const updateErrors = () => {
        if(!state.outcome) {return <></>}
        if(!state.outcome.message) {return <></>}
        
        const baseClass = 'p-3 mb-4 rounded-md font-medium text-sm border';
        const successClass = 'bg-green-100 text-green-700 border-green-200';
        const errorClass = 'bg-red-100 text-red-700 border-red-200';
        
        const className = state.outcome.success ? `${baseClass} ${successClass}` : `${baseClass} ${errorClass}`;
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
        if(user.firstname) {
            updateFormData('firstName', user.firstname)
        }
        else if(user.firstName) {
            updateFormData('firstName', user.firstName)
        }
        if(user.lastname) {
            updateFormData('lastName', user.lastname)
        }
        else if(user.lastName) {
            updateFormData('lastName', user.lastName)
        }
    }

    // Handle showing or hiding the admin code input
    const adminCodeInput = () => {
        if(!state.showAdminCode) {return <></>}
        return (
            <div className='mt-4'>
                <label htmlFor='update-admin-code' className={labelClass}>Admin Code</label>
                <input 
                    id='update-admin-code' 
                    name='adminCode' 
                    type='password' 
                    value={state.formData['adminCode'] ? state.formData['adminCode'] : ''}
                    onChange={(e) => {updateFormData('adminCode', e.target.value)}}
                    className={inputClass}
                required/>
            </div>
        )
    }

    // Function called when user is updated
    const updateUser = async (e) => {
        e.preventDefault();
        try {
            // Save form data in body of request
            const data = {};
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
                // update successful
                if(res.success) {
                    setOutcome(res);
                    if(res.user && currentUser.userid === res.user.userid) {
                        setCurrentUser(res.user);
                    }
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
        if(!currentUser.admin && currentUser.userid !== Number(userid)) {
            setUpdateAllowed(false);
            return;
        }
        // Check if the user data was passed in the location
        if(!location) {return setUserLoaded(false);}
        if(!location.state) {return setUserLoaded(false);}
        if(!location.state.user) {return setUserLoaded(false);}
        if(!(location.state.user.userid === Number(userid))) {return setUserLoaded(false);}
        
        // Load user data
        setUserLoaded(true);
        console.log('Loading User From Location');
        return populateForm(location.state.user);
    }

    // Load User
    useEffect(loadForm, [currentUser, location])

    // Generate View
    function generateView() {
        // Check if update is allowed 
        if(!updateAllowed) {return <div className="p-8 text-center text-red-600">You do not have permission to update this user.</div>}
        
        // Check if the user was loaded for edit
        if(!userLoaded) {return <div className="p-8 text-center text-gray-500">A user was not provided for updating.</div>}

        // return view
        return (
            <div className='max-w-md mx-auto p-8 bg-white shadow-xl rounded-lg mt-10'>
                <h1 className='text-2xl font-bold text-gray-900 mb-6'>Update User</h1>
                {updateErrors()}
                
                <form className='space-y-4' onSubmit={updateUser}>
                    <div>
                        <label htmlFor='update-email' className={labelClass}>Email Address</label>
                        <input 
                            id='update-email' 
                            name='email' 
                            type='email' 
                            value={state.formData['email']}
                            onChange={(e) => {updateFormData('email', e.target.value)}}
                            className={inputClass}
                        required/>
                    </div>
                    
                    <div className='flex gap-4'>
                        <div className='flex-1'>
                            <label htmlFor='update-firstName' className={labelClass}>First Name</label>
                            <input 
                                id='update-firstName' 
                                name='firstName' 
                                type='text'
                                value={state.formData['firstName']}
                                onChange={(e) => {updateFormData('firstName', e.target.value)}}
                                className={inputClass}
                            />
                        </div>
                        <div className='flex-1'>
                            <label htmlFor='update-lastName' className={labelClass}>Last Name</label>
                            <input 
                                id='update-lastName' 
                                name='lastName' 
                                type='text'
                                value={state.formData['lastName']}
                                onChange={(e) => {updateFormData('lastName', e.target.value)}}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    
                    <div className='flex items-center space-x-2'>
                        <input 
                            id='show-admin'
                            type='checkbox'
                            checked={state.showAdminCode}
                            onChange={(e) => {setShowAdminCode(e)}} 
                            className='h-4 w-4 text-green-700 border-gray-300 rounded focus:ring-green-500 accent-green-700'
                        />
                        <label htmlFor='show-admin' className='text-sm font-medium text-gray-700 cursor-pointer'>Admin Account?</label>
                    </div>

                    {adminCodeInput()}
                    
                    <div className='flex justify-end gap-3 pt-4'>
                        <button 
                            className='px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300' 
                            type='button' 
                            onClick={clearInputs}
                        >
                            Clear
                        </button>
                        <button 
                            className='px-4 py-2 text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-900 shadow-md transition-colors' 
                            type='submit'
                        >
                            Update
                        </button>
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