import './Header.css'
import { Link } from 'react-router-dom'
import { useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import LoginForm from '../Forms/LoginForm.jsx'
import UserBadge from '../Badges/UserBadge.jsx'
import Icon from '@mdi/react'
import { mdiMenu, mdiMenuOpen } from '@mdi/js'

const Header = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAccountSidebar, setShowAccountSidebar] = useState(false);
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

    // Left Sidebar Logo
    const dropdownLogo = () => {
        const logoPath = showDropdown ? mdiMenuOpen : mdiMenu;
        const clicked = () => {
            if(setShowDropdown) {
                setShowDropdown(prev => !prev)
            }
        }
        return <Icon path={logoPath} size={1} color={"white"} onClick={clicked}/>
    }

    // Function when left sidebar links are clicked
    function sideBarButtonHit() {
        setShowDropdown(false);
        setShowAccountSidebar(false);
    }

    // Left Sidebar
    const sideBar = () => {
        if(!showDropdown) {return <></>}

        const adminPage = () => {
            if(!currentUser) {return <></>}
            if(!currentUser.admin) {return <></>}
            return <Link to='/admin-page' onClick={sideBarButtonHit}>Admin Page</Link>
        }

        return (
            <div className='sidebar'>
                <Link to='/register' onClick={sideBarButtonHit}>Register</Link>
                {adminPage()}
            </div>
        )
    }

    // Function when right sidebar links are clicked
    function rightSideBarButtonHit() {
        setShowDropdown(false);
        setShowAccountSidebar(false);
    }

    // Function when right sidebar links are clicked
    const accountLinks = () => {
        if(!showAccountSidebar) {return <></>}
        if(!currentUser) {return <></>}
        return (
            <div id='account-links'>
                <Link to={`/users/${currentUser.userid}/update`} state={{user: currentUser}} onClick={rightSideBarButtonHit}>Update User</Link>
                <Link to={`/users/${currentUser.userid}/password`} onClick={rightSideBarButtonHit}>Change Password</Link>
            </div>
        )
    }

    // Header badge clicked
    const userBadgeClicked = () => {
        setShowAccountSidebar(prev => {
            return !prev
        })
    }

    // Header badge
    const userBadge = () => {
        return <UserBadge onClick={userBadgeClicked}/>
    }

    return (
        <div className='header'>
            <div id='header-link-div'>
                <Link to='/' className='header-link'>Home</Link>
                {dropdownLogo()}
                {sideBar()}
            </div>
            <div id='header-button-div'>
                {userBadge()}
                {currentUser ? logoutButton() : loginButton()}
                {accountLinks()}
            </div>
            <LoginForm 
                showLoginForm={showLoginForm}
                setShowLoginForm={setShowLoginForm}
            />
        </div>
    )
};

export default Header