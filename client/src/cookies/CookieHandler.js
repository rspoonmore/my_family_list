const apiUrl = import.meta.env.VITE_API_URL;

function clearCookiesIfNoCurrentUser(currentUser) {
    if(currentUser) {return}
    console.log('Clearing Cookies');
    const cookies = document.cookie.split(';');
    for(let i = 0;i < cookies.length; i++) {
        if(cookies[i].split('=')[0].trim() === 'jwt' || cookies[i].split(':')[0].trim() === 'jwt') {
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            return
        };
    };
    return;
}

async function setCurrentUserIfCookie(currentUser, setCurrentUser) {
    if(currentUser) {return}

    async function getCurrentUser() {
        fetch(`${apiUrl}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        .then(res => res.json())
        .then(outcome => {
            if(outcome.success && outcome.user){
                setCurrentUser(outcome.user)
            }
        })
    }

    const cookies = document.cookie.split(';');
    for(let i = 0;i < cookies.length; i++) {
        if(cookies[i].split('=')[0].trim() === 'jwt' || cookies[i].split(':')[0].trim() === 'jwt') {
            getCurrentUser()
            return
        };
    };
}

export {clearCookiesIfNoCurrentUser, setCurrentUserIfCookie}