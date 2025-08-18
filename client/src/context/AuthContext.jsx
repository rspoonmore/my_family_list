import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        // Load from LocalStorage
        const storedUser = localStorage.getItem('currentUser');
        if(storedUser) { // currentUser found in local storage
            console.log('currentUser loaded from local storage:', storedUser);
            return JSON.parse(storedUser);
        }
        // No currentUser
        console.log('No currentUser found in local storage');
        return null;
    });

    function updateUser() {
        if (currentUser !== null) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser))
            console.log('User saved in local storage');
        }
        else {
            localStorage.setItem('currentUser', JSON.stringify(currentUser))
            console.log('Null user saved in local storage');
        }
    }

    useEffect(updateUser, [currentUser])

    const authContextValue = {
        currentUser,
        setCurrentUser
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider }