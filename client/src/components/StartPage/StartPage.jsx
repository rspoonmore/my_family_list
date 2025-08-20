import './StartPage.css';
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell';

const StartPageView = () => {
    const { currentUser } = useContext(AuthContext);

    function page() {
        return (
            <div id='start-page-container'>
                <p>{`Hello ${currentUser ? currentUser.email : ""}, `}</p>
                <br></br>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;Welcome to the family list! This is a simple website put together to help with any Christmas / birthday / celebration lists. For any list where the user is added, they may add items for themselves. When others view this list afterwards, they can mark what they have purchased and allow others to see what is left available without the original user knowing. Now the tracking of what all has been purchased from someone's list can be tracked in one centralized location!</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;This is a labor of love, and is by no means some sleak and perfect site. Please be patient as I try to build this out and improve it as we go.</p>
                <br></br>
                <p>Thank you for your participation, and your patience!</p>
                <p>Ryan Spoonmore</p>
            </div>
        )
    }

    return page()
}

const StartPage = () => {
    return <PageShell mainView={StartPageView} />
}

export default StartPage