import ('./RegisterPage.css');
import { useState } from 'react';

const RegisterPage = () => {
    const blankFormData = {'email': '', 'firstName': '', 'lastName': '', 'password': '', adminCode: null}
    const [formData, setFormData] = useState(blankFormData);
    const [outcome, setOutcome] = useState(null);
    const [showAdminCode, setShowAdminCode] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;

    const registerErrors = () => {
        if(!outcome) {return <></>}
        // if(outcome.success) {return <></>}
        if(!outcome.message) {return <></>}
        const className = outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{outcome.message}</div>
    }

    const clearInputs = () => {
        setFormData(blankFormData);
        setShowAdminCode(false);
    }

    const adminCodeInput = () => {
        if(!showAdminCode) {return <></>}
        return (
            <>
            <label htmlFor='register-admin-code'>Admin Code</label>
            <input 
                id='register-admin-code' 
                name='adminCode' 
                type='password' 
                value={formData['adminCode'] ? formData['adminCode'] : ''}
                onChange={(e) => {setFormData(prev => ({...prev, adminCode: e.target.value}))}}
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
            for(const key in formData) {
                data[key] = formData[key];
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
        <div id='register-container'>
            <h1>Register a New User</h1>
            {registerErrors()}
            <form className='form-register' onSubmit={register}>
                <label htmlFor='register-email'>Email Address</label>
                <input 
                    id='register-email' 
                    name='email' 
                    type='email' 
                    value={formData['email']}
                    onChange={(e) => {setFormData(prev => ({...prev, email: e.target.value}))}}
                required/>
                <label htmlFor='register-firstName'>First Name</label>
                <input 
                    id='register-firstName' 
                    name='firstName' 
                    type='firstName' 
                    value={formData['firstName']}
                    onChange={(e) => {setFormData(prev => ({...prev, firstName: e.target.value}))}}
                />
                <label htmlFor='register-lastName'>Last Name</label>
                <input 
                    id='register-lastName' 
                    name='lastName' 
                    type='lastName' 
                    value={formData['lastName']}
                    onChange={(e) => {setFormData(prev => ({...prev, lastName: e.target.value}))}}
                />
                <label htmlFor='register-password'>Password</label>
                <input 
                    id='register-password' 
                    name='password' 
                    type='password' 
                    value={formData['password']}
                    onChange={(e) => {setFormData(prev => ({...prev, password: e.target.value}))}}
                required/>
                <label htmlFor='show-admin'>Admin Account?</label>
                <input 
                    id='show-admin'
                    type='checkbox'
                    checked={showAdminCode}
                    onChange={(e) => {setShowAdminCode(e.target.checked === true)}} 
                />
                {adminCodeInput()}
                <div id='form-register-btns'>
                    <button className='btn' type='button' onClick={clearInputs}>Clear</button>
                    <button className='btn' type='submit'>Register</button>
                </div>
            </form>
        </div>
    )
};

export default RegisterPage;