import './PageShell.css';
import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
import Header from '../Header/Header.jsx'
import { clearCurrentUserIfNoCookie, clearCookiesIfNoCurrentUser } from '../../cookies/CookieHandler.js';



const PageShell = ({mainView=null}) => {
    
    const { currentUser, setCurrentUser } = useContext(AuthContext);

    const loadScreen = () => {
        console.log('Loading Screen')
        clearCookiesIfNoCurrentUser(currentUser);
        clearCurrentUserIfNoCookie(setCurrentUser);
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