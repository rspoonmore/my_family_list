import { useState, useContext } from 'react'
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'

const LoginForm = ({showLoginForm = false, setShowLoginForm = null}) => {
    const blankForm = {'email': '', 'password': ''};
    const [formData, setFormData] = useState(blankForm);
    const apiUrl = import.meta.env.VITE_API_URL;
    const [outcome, setOutcome] = useState(null);
    const { loginUser } = useContext(AuthContext);

    const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
    const primaryButtonClass = 'px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-700 hover:bg-green-900 transition-colors shadow-md';
    const secondaryButtonClass = 'px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors';

    const LoginErrors = () => {
        if(!outcome) {return <></>}
        if(outcome.success) {return <></>}
        if(!outcome.message) {return <></>}
        return <div className='p-2 text-xs font-medium text-red-700 bg-red-100 rounded'>{outcome.message}</div>
    }

    function hideLogin() {
        setFormData(blankForm);
        setOutcome(null);
        if(setShowLoginForm) {
            setShowLoginForm(false)
        }
    }

    const login = async (e) => {
        e.preventDefault();
        setOutcome(null);
        try {
            // Save form data in body of request
            const data = {...formData};
            
            // post login
            await fetch(`${apiUrl}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(res => {
                // If login was successful
                console.log('Logged in user: ', JSON.stringify(res?.user?.email || []))
                if(res?.success && res?.user){
                    loginUser(res?.user);
                    hideLogin();
                }
                // If login was not successful
                else {
                    setOutcome(res);
                }
            })
            
        } catch(error) {
            console.log(error)
            setOutcome({success: false, message: 'An unexpected error occurred.'});
        }
    }

    const cancel = () => {
        hideLogin();
    }

    if(!showLoginForm) {return null}

    return (
        <div className='absolute right-0 top-full w-64 p-4 bg-white rounded-lg shadow-2xl z-20'>
            <span className='block text-xl font-semibold text-gray-800 mb-3'>Log In</span>
            
            {LoginErrors()}
            
            <form className='flex flex-col space-y-3' onSubmit={login}>
                
                {/* Email Input */}
                <input 
                    id='email' 
                    name='email' 
                    type='email' 
                    placeholder="Email"
                    value={formData['email']}
                    onChange={(e) => {setFormData(prev => ({...prev, email: e.target.value}))}}
                    className={inputClass}
                required/>
                
                {/* Password Input */}
                <input 
                    id='password' 
                    name='password' 
                    type='password' 
                    placeholder="Password"
                    value={formData['password']}
                    onChange={(e) => {setFormData(prev => ({...prev, password: e.target.value}))}}
                    className={inputClass}
                required/>
                
                {/* Button Group */}
                <div className='flex justify-between items-center pt-2'>
                    <Link to="/register" onClick={cancel} className='text-sm text-indigo-600 hover:text-indigo-800'>
                        Register
                    </Link>
                    <div className='flex gap-2'>
                        <button className={secondaryButtonClass} type='button' onClick={cancel}>
                            Cancel
                        </button>
                        <button className={primaryButtonClass} type='submit'>
                            Log In
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default LoginForm;