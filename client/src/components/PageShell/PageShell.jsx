import './PageShell.css';
import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
import Header from '../Header/Header.jsx'
import { clearCurrentUserIfNoCookie, clearCookiesIfNoCurrentUser } from '../../cookies/CookieHandler.js';



const PageShell = ({mainView=null}) => {
    
    const { currentUser, setCurrentUser, isInitialized } = useContext(AuthContext);

    const loadScreen = () => {
        if(!isInitialized) {return}
        // clearCookiesIfNoCurrentUser(currentUser);
        // clearCurrentUserIfNoCookie(setCurrentUser);
        
        // setCurrentUserIfCookie(currentUser, setCurrentUser)
    }

    useEffect(loadScreen, [])

    const footer = () => {
        return (
            <div id='footer'>
                <span>Website by Ryan Spoonmore</span>
                <span>Icons courtesy of pictogrammers.com</span>
            </div>
        )
    }

    const pageShell = () => {
        if(!isInitialized) {return <div className='p-10 text-center'>Loading application...</div>;}

        return (
            <div id='shell-container'>
                <Header />
                <div id='shell-content'>
                    {mainView ? mainView() : <div>Main View</div>}
                </div>
                {footer()}
            </div>
        )
    }

    return pageShell()
    
}

export default PageShell