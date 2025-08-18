import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

const UserBadge = ({onClick = () => {console.log('Badge Clicked')}}) => {
    const { currentUser } = useContext(AuthContext);

    const setBadgeText = () => {
        if(currentUser.firstname && currentUser.lastname) {
            return currentUser.firstname.slice(0, 1).toUpperCase() + currentUser.lastname.slice(0, 1).toUpperCase();
        }
        if (currentUser.firstname) {
            return currentUser.firstname.slice(0, 1).toUpperCase();
        }
        if (currentUser.email) {
            return currentUser.email.slice(0, 1).toUpperCase();
        }
        return 'U';
    }

    if(!currentUser) {return <></>}
    return <button className='badge' onClick={onClick}>{setBadgeText()}</button>
}

export default UserBadge