import ('./RegisterPage.css');
import { useState } from 'react';
import PageShell from '../PageShell/PageShell';

const RegisterPageView = () => {
    const blankFormData = {'email': '', 'firstName': '', 'lastName': '', 'password': '', adminCode: null}
    const startingState = {
        'formData': blankFormData,
        'outcome': null,
        'showAdminCode': false
    }
    const [state, setState] = useState(startingState)
    const apiUrl = import.meta.env.VITE_API_URL;

    const registerErrors = () => {
        if(!state.outcome) {return <></>}
        // if(outcome.success) {return <></>}
        if(!state.outcome.message) {return <></>}
        const className = state.outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{state.outcome.message}</div>
    }

    const updateFormData = (key, e) => {
        setState(prev => {
            let copy = {...prev}
            copy['formData'][key] = e.target.value;
            return copy
        })
    }

    const setShowAdminCode = (e) => {
        setState(prev => ({
            ...prev,
            showAdminCode: e.checked === true
        }))
    }

    const setOutcome = (o) => {
        setState(prev => ({
            ...prev,
            outcome: o
        }))
    }

    const clearInputs = () => {
        setState(startingState);
    }

    const adminCodeInput = () => {
        if(!state.showAdminCode) {return <></>}
        return (
            <>
            <label htmlFor='register-admin-code'>Admin Code</label>
            <input 
                id='register-admin-code' 
                name='adminCode' 
                type='password' 
                value={state.formData['adminCode'] ? state.formData['adminCode'] : ''}
                onChange={(e) => {updateFormData('adminCode', e)}}
            required/>
            </>
        )
    }

    const register = async (e) => {
        e.preventDefault();
        console.log('Registering User');
        try {
            // Save form data in body of request
            const data = new FormData();
            for(const key in state.formData) {
                data[key] = state.formData[key];
            }
            
            // post register
            console.log(data);
            await fetch(`${apiUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                console.log(res)
                // register successful
                if(res.success) {
                    setOutcome(res);
                    clearInputs();
                }
                // register was not successful
                else {
                    setOutcome(res);
                }
            })
        } catch(error) {
            console.log(error);
        }
    }

    
    return (
        <div className='standard-form-container'>
            <h1>Register a New User</h1>
            {registerErrors()}
            <form className='standard-form' onSubmit={register}>
                <label htmlFor='register-email'>Email Address</label>
                <input 
                    id='register-email' 
                    name='email' 
                    type='email' 
                    value={state.formData['email']}
                    onChange={(e) => {updateFormData('email', e)}}
                required/>
                <label htmlFor='register-firstName'>First Name</label>
                <input 
                    id='register-firstName' 
                    name='firstName' 
                    type='firstName' 
                    value={state.formData['firstName']}
                    onChange={(e) => {updateFormData('firstName', e)}}
                />
                <label htmlFor='register-lastName'>Last Name</label>
                <input 
                    id='register-lastName' 
                    name='lastName' 
                    type='lastName' 
                    value={state.formData['lastName']}
                    onChange={(e) => {updateFormData('lastName', e)}}
                />
                <label htmlFor='register-password'>Password</label>
                <input 
                    id='register-password' 
                    name='password' 
                    type='password' 
                    value={state.formData['password']}
                    onChange={(e) => {updateFormData('password', e)}}
                required/>
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
                    <button className='btn' type='submit'>Register</button>
                </div>
            </form>
        </div>
    )
};

const RegisterPage = () => {
    return <PageShell mainView={RegisterPageView} />
}

export default RegisterPage;