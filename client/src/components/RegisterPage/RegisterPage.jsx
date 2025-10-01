import { useState } from 'react';
import PageShell from '../PageShell/PageShell';

const RegisterPageView = () => {
    const blankFormData = {'email': '', 'firstName': '', 'lastName': '', 'password': ''}
    const startingState = {
        'formData': blankFormData,
        'outcome': null,
        'showAdminCode': false
    }
    const [state, setState] = useState(startingState)
    const apiUrl = import.meta.env.VITE_API_URL;

    const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
    const labelClass = 'block text-sm font-medium text-gray-700 mt-2';

    const registerErrors = () => {
        if(!state.outcome) {return <></>}
        if(!state.outcome.message) {return <></>}
        
        const baseClass = 'p-3 mb-4 rounded-md font-medium text-sm border';
        const successClass = 'bg-green-100 text-green-700 border-green-200';
        const errorClass = 'bg-red-100 text-red-700 border-red-200';
        
        const className = state.outcome.success ? `${baseClass} ${successClass}` : `${baseClass} ${errorClass}`;

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
            showAdminCode: e.target.checked === true
        }))
    }

    const setOutcome = (o) => {
        setState(prev => ({
            ...prev,
            outcome: o
        }))
    }

    const clearInputs = () => {
        setState(prev => ({
            ...prev,
            formData: blankFormData,
            showAdminCode: false
        }));
    }

    const adminCodeInput = () => {
        if(!state.showAdminCode) {return <></>}
        return (
            <>
            <label htmlFor='register-admin-code' className={labelClass}>Admin Code</label>
            <input 
                id='register-admin-code' 
                name='adminCode' 
                type='password' 
                value={state.formData['adminCode'] ? state.formData['adminCode'] : ''}
                onChange={(e) => {updateFormData('adminCode', e)}}
                className={inputClass}
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
        <div className='max-w-md mx-auto p-8 bg-white shadow-xl rounded-lg mt-10'>
            <h1 className='text-2xl font-bold text-gray-900 mb-6'>Register a New User</h1>
            {registerErrors()}
            <form className='space-y-4' onSubmit={register}>
                <label htmlFor='register-email' className={labelClass}>Email Address</label>
                <input 
                    id='register-email' 
                    name='email' 
                    type='email' 
                    value={state.formData['email']}
                    onChange={(e) => {updateFormData('email', e)}}
                    className={inputClass}
                required/>
                
                <div className='flex gap-4'>
                    <div className='flex-1'>
                        <label htmlFor='register-firstName' className={labelClass}>First Name</label>
                        <input
                            id='register-firstName'
                            name='firstName'
                            type='firstName'
                            value={state.formData['firstName']}
                            onChange={(e) => {updateFormData('firstName', e)}}
                            className={inputClass}
                        />
                    </div>
                    <div className='flex-1'>
                        <label htmlFor='register-lastName' className={labelClass}>Last Name</label>
                        <input
                            id='register-lastName'
                            name='lastName'
                            type='lastName'
                            value={state.formData['lastName']}
                            onChange={(e) => {updateFormData('lastName', e)}}
                            className={inputClass}
                        />
                    </div>
                </div>
                <label htmlFor='register-password' className={labelClass}>Password</label>
                <input 
                    id='register-password' 
                    name='password' 
                    type='password' 
                    value={state.formData['password']}
                    onChange={(e) => {updateFormData('password', e)}}
                    className={inputClass}
                required/>

                <div className='flex items-center space-x-2 mt-4'>
                    <input 
                        id='show-admin'
                        type='checkbox'
                        checked={state.showAdminCode}
                        onChange={(e) => {setShowAdminCode(e)}} 
                        className='h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500'
                    />
                    <label htmlFor='show-admin' className='text-sm font-medium text-gray-700 cursor-pointer'>Admin Account?</label>
                </div>

                {adminCodeInput()}
                <div className='flex justify-end gap-3 pt-4'>
                    <button 
                        className='px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300'
                        type='button' 
                        onClick={clearInputs}
                    >Clear</button>
                    <button 
                        className='px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300'
                        type='submit'
                    >Register</button>
                </div>
            </form>
        </div>
    )
};

const RegisterPage = () => {
    return <PageShell mainView={RegisterPageView} />
}

export default RegisterPage;