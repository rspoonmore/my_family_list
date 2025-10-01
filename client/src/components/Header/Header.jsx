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
    const { currentUser, logoutUser } = useContext(AuthContext);
    const apiUrl = import.meta.env.VITE_API_URL;

    const linkClass = 'text-gray-200 hover:text-white transition-colors duration-200 px-3 py-2 rounded-md font-medium';
    const buttonClass = 'px-4 py-2 text-sm font-medium rounded-lg text-green-700 bg-white hover:bg-gray-200 transition-colors shadow-md';
    const sidebarLinkClass = 'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors';

    const loginButton = () => {
        function loginClicked() {
            setShowLoginForm(prev => {return !prev});
        }
        return <button className={buttonClass} onClick={loginClicked}>Login</button>
    }

    const logoutButton = () => {
        async function logout() {
            try {
                // POST to logout API
                fetch(`${apiUrl}/users/logout`, {
                    method: 'POST',
                    credentials: 'include'
                })
                .then(res => res.json())
                .then(res => {
                    // If logout was successful
                    if(res.success){
                        logoutUser();
                        setShowLoginForm(false);
                    }
                    else {
                        console.log('Logout not successful: ', res)
                    }
                })
            } catch(error) {
                console.log(error)
            }
        }
        return <button className='px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors' onClick={logout}>Logout</button>
    }

    const dropdownLogo = () => {
        // ... (existing logic for toggling menu) ...
        const iconPath = showDropdown ? mdiMenuOpen : mdiMenu;
        return (
            <div className='relative'>
                <button className={linkClass} onClick={() => {setShowDropdown(prev => !prev)}}>
                    <Icon path={iconPath} size={1} />
                </button>
                {sideBar()}
            </div>
        )
    }

    const sideBar = () => {
        if(!showDropdown) {return null}
        return (
            <div className='absolute left-0 top-full mt-3 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20'>
                <div className='py-1' role='menu' aria-orientation='vertical'>
                    <Link to='/register' className={sidebarLinkClass} role='menuitem'>Register User</Link>
                    {currentUser?.admin && <Link to='/admin-page' className={sidebarLinkClass} role='menuitem'>Admin Page</Link>}
                </div>
            </div>
        )
    }

    function rightSideBarButtonHit() {
        setShowDropdown(false);
        setShowAccountSidebar(false);
    }

    // Function when right sidebar links are clicked
    const accountLinks = () => {
        if(!currentUser) {return null}
        
        const visibilityClass = showAccountSidebar ? '' : 'hidden';

        return (
            <div className={`absolute right-0 top-full w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 ${visibilityClass}`}>
                <div className='py-1' role='menu' aria-orientation='vertical'>
                    <Link to={`/users/${currentUser?.userid}/update`} state={{user: currentUser}} onClick={rightSideBarButtonHit} className={sidebarLinkClass} role='menuitem'>Update User</Link>
                    <Link to={`/users/${currentUser?.userid}/password`} onClick={rightSideBarButtonHit} className={sidebarLinkClass} role='menuitem'>Change Password</Link>
                </div>
            </div>
        )
    }

    // Header badge clicked
    const userBadgeClicked = () => {
        setShowAccountSidebar(prev => !prev)
    }

    const userBadge = () => {
        return <UserBadge onClick={userBadgeClicked}/>
    }

    return (
        <div className='sticky top-0 z-10 bg-green-700 shadow-xl'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center h-16 relative'>

                    {/* Left side: Home Link & Dropdown */}
                    <div className='flex items-center space-x-4'>
                        <Link to='/' className={linkClass}>Home</Link>
                        {dropdownLogo()}
                    </div>

                    {/* Right side: User & Auth Buttons */}
                    <div className='flex items-center space-x-4'>
                        {currentUser && userBadge()}
                        {currentUser ? logoutButton() : loginButton()}
                        {accountLinks()}
                    </div>
                </div>
            </div>
            <LoginForm 
                showLoginForm={showLoginForm}
                setShowLoginForm={setShowLoginForm}
            />
        </div>
    )
};

export default Header