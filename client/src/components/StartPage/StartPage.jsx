import './StartPage.css';
import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import Header from '../Header/Header.jsx'
import { setCurrentUserIfCookie } from '../../cookies/CookieHandler.js';

const StartPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser, setCurrentUser } = useContext(AuthContext);

    const loadScreen = () => {
        console.log('Loading Screen')
        setIsLoading(true);
        setCurrentUserIfCookie(currentUser, setCurrentUser)
        setIsLoading(false);
    }

    useEffect(loadScreen, [currentUser])

    function page() {
        if(isLoading) {
            return <div>Loading...</div>
        }
        return (
            <div>
                <Header></Header>
                <div>Hello {currentUser ? currentUser.email : 'World'}</div>
            </div>
        )
    }

    return page()
}

export default StartPage