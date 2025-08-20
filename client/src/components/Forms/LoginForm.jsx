import './LoginForm.css'
import { useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

const LoginForm = ({className, setShowLoginForm}) => {
    const blankForm = {'email': '', 'password': ''};
    const [formData, setFormData] = useState(blankForm);
    const apiUrl = import.meta.env.VITE_API_URL;
    const [outcome, setOutcome] = useState(null);
    const { setCurrentUser } = useContext(AuthContext);

    const LoginErrors = () => {
        if(!outcome) {return <></>}
        if(outcome.success) {return <></>}
        if(!outcome.message) {return <></>}
        return <div className='error-simple'>{outcome.message}</div>
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
        console.log(`Logging in at ${apiUrl}`);
        try {
            // Save form data in body of request
            const data = new FormData();
            for(const key in formData) {
                data[key] = formData[key];
            }
            
            // post login
            await fetch(`${apiUrl}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                // login successful
                if(res.success) {
                    setCurrentUser(res.user);
                    hideLogin();
                    window.location.reload();
                }
                // login was not successful
                else {
                    setOutcome(res);
                }
            })
            
        } catch(error) {
            console.log(error)
        }
    }

    const cancel = () => {
        console.log('Canceling Login');
        hideLogin();
    }

    return (
        <div className={className}>
            <span>Log In</span>
            {LoginErrors()}
            <form className='form-login' onSubmit={login}>
                <input 
                    id='email' 
                    name='email' 
                    type='email' 
                    placeholder="Email"
                    value={formData['email']}
                    onChange={(e) => {setFormData(prev => ({...prev, email: e.target.value}))}}
                required/>
                <input 
                    id='password' 
                    name='password' 
                    type='password' 
                    placeholder="Password"
                    value={formData['password']}
                    onChange={(e) => {setFormData(prev => ({...prev, password: e.target.value}))}}
                required/>
                <div id='form-login-btns'>
                    <button className='btn btn-small' type='button' onClick={cancel}>Cancel</button>
                    <button className='btn btn-small' type='submit'>Log In</button>
                </div>
            </form>
        </div>
    )
}

export default LoginForm;