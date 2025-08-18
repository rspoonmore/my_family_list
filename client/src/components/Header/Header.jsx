import './Header.css'
import { Link } from 'react-router-dom'
import { useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import LoginForm from '../Forms/LoginForm.jsx'

const Header = ({dropdownLogo = null, userBadge = () => {return <></>}}) => {
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
                <Link to='/' className='header-link'>Home</Link>
                {dropdownLogo()}
            </div>
            <div id='header-button-div'>
                {userBadge()}
                {currentUser ? logoutButton() : loginButton()}
            </div>
            <LoginForm 
                className={showLoginForm ? 'pop-up-right' : 'hidden'}
                setShowLoginForm={setShowLoginForm}
            />
        </div>
    )
};

export default Header