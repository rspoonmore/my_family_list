import './StartPage.css';
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

const StartPage = () => {
    const { currentUser } = useContext(AuthContext);

    function page() {
        return (
            <div>
                <div>Hello {currentUser ? currentUser.email : 'World'}</div>
            </div>
        )
    }

    return page()
}

export default StartPage