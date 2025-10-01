import { createContext, useState, useEffect } from "react";
import { clearCurrentUserIfNoCookie, clearCookiesIfNoCurrentUser } from "../cookies/CookieHandler";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    function clearCurrentUser() {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
    }

    useEffect(() => {
        // 1. Check local storage
        console.log('Checking for currentUser')
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                // 2. Load user if found
                console.log('currentUser Found: ', JSON.parse(storedUser));
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                // Clear bad data just in case
                localStorage.removeItem('currentUser');
            }
        }
        else {
            console.log('No currentUser found.');
            clearCookiesIfNoCurrentUser()
        }
        clearCurrentUserIfNoCookie(clearCurrentUser);
        
        // 3. Mark as initialized AFTER checking storage
        setIsInitialized(true); 
    }, []);

    const authContextValue = {
        currentUser,
        setCurrentUser,
        isInitialized
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider }