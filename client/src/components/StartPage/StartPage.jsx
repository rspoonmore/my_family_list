import './StartPage.css';
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell';

const StartPageView = () => {
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

const StartPage = () => {
    return <PageShell mainView={StartPageView} />
}

export default StartPage