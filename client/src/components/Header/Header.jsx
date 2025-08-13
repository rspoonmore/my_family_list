import './Header.css'
import { Link } from 'react-router-dom'
import { useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import LoginForm from '../LoginForm/LoginForm.jsx'

const Header = () => {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const { currentUser, setCurrentUser } = useContext(AuthContext);

    const loginButton = () => {
        function loginClicked() {
            setShowLoginForm(true);
        }

        return <button className='btn' onClick={loginClicked}>Login</button>
    }

    return (
        <div className='header'>
            <div id='header-link-div'>
                <Link to='/'>Home</Link>
            </div>
            <div id='header-button-div'>
                {loginButton()}
            </div>
            {<LoginForm 
                className={showLoginForm ? 'pop-up' : 'hidden'}
                setShowLoginForm={setShowLoginForm}
            ></LoginForm>}
        </div>
    )
};

export default Header