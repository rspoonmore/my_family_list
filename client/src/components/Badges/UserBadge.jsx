import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

const UserBadge = ({onClick = () => {console.log('Badge Clicked')}}) => {
    const { currentUser } = useContext(AuthContext);

    const badgeClass = 'w-8 h-8 rounded-full bg-white text-green-700 text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors shadow-md';

    const setBadgeText = () => {
        if(currentUser?.firstname && currentUser?.lastname) {
            return currentUser?.firstname.slice(0, 1).toUpperCase() + currentUser?.lastname.slice(0, 1).toUpperCase();
        }
        if (currentUser?.firstname) {
            return currentUser?.firstname.slice(0, 1).toUpperCase();
        }
        if (currentUser?.email) {
            return currentUser?.email.slice(0, 1).toUpperCase();
        }
        return 'U';
    }

    if(!currentUser) {return <></>}
    return <button className={badgeClass} onClick={onClick}>{setBadgeText()}</button>
}

export default UserBadge