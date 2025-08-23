import './PageShell.css';
import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
import Header from '../Header/Header.jsx'
import { setCurrentUserIfCookie, clearCookiesIfNoCurrentUser } from '../../cookies/CookieHandler.js';
import UserBadge from '../Badges/UserBadge.jsx'
import Icon from '@mdi/react'
import { mdiMenu, mdiMenuOpen } from '@mdi/js'


const PageShell = ({mainView=null}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAccountSidebar, setShowAccountSidebar] = useState(false);
    const { currentUser } = useContext(AuthContext);

    const loadScreen = () => {
        console.log('Loading Screen')
        clearCookiesIfNoCurrentUser(currentUser)
        // setCurrentUserIfCookie(currentUser, setCurrentUser)
    }

    useEffect(loadScreen, [])

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
        const adminPage = () => {
            if(!currentUser) {return <></>}
            if(!currentUser.admin) {return <></>}
            return <Link to='/admin-page' onClick={sideBarButtonHit}>Admin Page</Link>
        }

        return (
            <div className={showDropdown ? 'sidebar' : 'hidden'}>
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

    const footer = () => {
        return (
            <div id='footer'>
                <span>Website by Ryan Spoonmore</span>
                <span>Icons courtesy of pictogrammers.com</span>
            </div>
        )
    }

    const pageShell = () => {
        return (
            <div id='shell-container'>
                <Header dropdownLogo={dropdownLogo} userBadge={userBadge}></Header>
                <div id='shell-content'>
                    {sideBar()}
                    {accountLinks()}
                    {mainView ? mainView() : <div>Main View</div>}
                </div>
                {footer()}
            </div>
        )
    }

    return pageShell()
    
}

export default PageShell