import './PageShell.css';
import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
import Header from '../Header/Header.jsx'
import { setCurrentUserIfCookie } from '../../cookies/CookieHandler.js';



const PageShell = ({mainView=null}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const { currentUser, setCurrentUser } = useContext(AuthContext);

    const loadScreen = () => {
        console.log('Loading Screen')
        setCurrentUserIfCookie(currentUser, setCurrentUser)
    }

    useEffect(loadScreen, [])

    function sideBarButtonHit() {
        setShowDropdown(false);
    }

    const sideBar = () => {
        return (
            <div id='sidebar' className={showDropdown ? '' : 'hidden'}>
                <Link to='/register' onClick={sideBarButtonHit}>Register</Link>
            </div>
        )
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
                <Header showDropdown={showDropdown} setShowDropdown={setShowDropdown}></Header>
                <div id='shell-content'>
                    {sideBar()}
                    {mainView ? mainView() : <div>Main View</div>}
                </div>
                {footer()}
            </div>
        )
    }

    return pageShell()
    
}

export default PageShell