import './Header.css'
import { Link } from 'react-router-dom'
import { useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import LoginForm from '../LoginForm/LoginForm.jsx'

const Header = () => {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const apiUrl = import.meta.env.VITE_API_URL;

    const loginButton = () => {
        function loginClicked() {
            setShowLoginForm(true);
        }

        return <button className='btn' onClick={loginClicked}>Login</button>
    }

    const logoutButton = () => {
        async function logout() {
            try {
                console.log('Logging Out')
                // POST to logout API
                fetch(`${apiUrl}/users/logout`, {
                    method: 'POST',
                    credentials: 'include'
                })
                .then(res => res.json())
                .then(res => {
                    // If logout was successful
                    if(res.success){
                        setCurrentUser(null);
                        setShowLoginForm(false);
                    }
                    else {
                        console.log(JSON.stringify(res))
                    }
                })
            } catch(error) {
                console.log(error)
            }
        }

        return <button className='btn' onClick={logout}>Log Out</button>
    }

    return (
        <div className='header'>
            <div id='header-link-div'>
                <Link to='/'>Home</Link>
            </div>
            <div id='header-button-div'>
                {currentUser ? logoutButton() : loginButton()}
            </div>
            {<LoginForm 
                className={showLoginForm ? 'pop-up' : 'hidden'}
                setShowLoginForm={setShowLoginForm}
            ></LoginForm>}
        </div>
    )
};

export default Header