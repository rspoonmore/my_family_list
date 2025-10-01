import './PageShell.css';
// import { useContext, useEffect } from 'react';
// import { AuthContext } from '../../context/AuthContext'
import Header from '../Header/Header.jsx'



const PageShell = ({mainView=null}) => {
    
    // const { isInitialized } = useContext(AuthContext);

    // const loadScreen = () => {
    //     if(!isInitialized) {return}
    //     // clearCookiesIfNoCurrentUser(currentUser);
    //     // clearCurrentUserIfNoCookie(setCurrentUser);
        
    //     // setCurrentUserIfCookie(currentUser, setCurrentUser)
    // }

    // useEffect(loadScreen, [])

    const footer = () => {
        return (
            <div id='footer'>
                <span>Website by Ryan Spoonmore</span>
                <span>Icons courtesy of pictogrammers.com</span>
            </div>
        )
    }

    function renderView() {
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
    
    return renderView();
    
}

export default PageShell