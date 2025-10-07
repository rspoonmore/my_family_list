const apiUrl = import.meta.env.VITE_API_URL;

// function clearCookiesIfNoCurrentUser(currentUser) {
//     if(currentUser) {return}
//     console.log('Clearing Cookies');
//     const cookies = document.cookie.split(';');
//     for(let i = 0;i < cookies.length; i++) {
//         if(cookies[i].split('=')[0].trim() === 'jwt' || cookies[i].split(':')[0].trim() === 'jwt') {
//             console.log('JWT cookie found. Setting to expire.')
//             document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//             return
//         };
//     };
//     return;
// }

// function clearCurrentUserIfNoCookie(clearCurentUser) {
//     const cookies = document.cookie.split(';');
//     console.log('cookies found: ', cookies)
//     for(let i = 0;i < cookies.length; i++) {
//         if(cookies[i].split('=')[0].trim() === 'jwt' || cookies[i].split(':')[0].trim() === 'jwt') {
//             // JWT cookie found
//             return;
//         };
//     };

//     // No JWT cookie found
//     console.log('No JWT cookie found. Clearing current user.')
//     clearCurentUser();
// }

async function setCurrentUserIfCookie(currentUser, setCurrentUser) {
    if(currentUser) {return}

    async function checkSession() {
        // This endpoint should simply verify the 'jwt' cookie and return the user
        const response = await fetch(`${apiUrl}/users/session`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const outcome = await response.json();
        // console.log('server session outcome: ', outcome);
        // If the server successfully authenticated via the cookie
        if(outcome.success && outcome.user){
            setCurrentUser(outcome.user);
        } else {
            // If the server says the session is invalid, ensure currentUser is null
            setCurrentUser(null);
        }
    }

    checkSession();
}

// export {clearCookiesIfNoCurrentUser, setCurrentUserIfCookie, clearCurrentUserIfNoCookie}
export {setCurrentUserIfCookie}