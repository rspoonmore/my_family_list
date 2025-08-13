import './LoginForm.css'
import { useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

const LoginForm = ({className, setShowLoginForm}) => {
    const blankForm = {'email': '', 'password': ''};
    const [formData, setFormData] = useState(blankForm);
    const [outcome, setOutcome] = useState(null);
    const { setCurrentUser } = useContext(AuthContext);

    function hideLogin() {
        setFormData(blankForm);
        if(setShowLoginForm) {
            setShowLoginForm(false)
        }
    }

    const login = async (e) => {
        e.preventDefault();
        console.log('Logging in');
        try {
            const data = new FormData();
            for(const key in formData) {
                data[key] = formData[key];
            }
            
            console.log(data);
            hideLogin();
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