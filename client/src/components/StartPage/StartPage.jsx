import './StartPage.css';
import { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'

const StartPage = () => {
    const { currentUser } = useContext(AuthContext);
    const [state, setState] = useState(null);

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