import './StartPage.css';
import { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell';

const StartPageView = () => {
    const { currentUser } = useContext(AuthContext);
    const [lists, setLists] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    async function loadLists() {
        if(!currentUser?.userid) {return null}
        try {
            const response = await fetch(`${apiUrl}/lists/?userid=${Number(currentUser.userid)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const res = await response.json();
            if(res?.success) {
                setLists(res?.lists || []);
                return
            }

        } catch(error) {
            console.log(error)
        }
    }

    useEffect(() => {loadLists()}, [currentUser])

    function welcomePage() {
        return (
            <div id='start-page-container'>
                <p>Hello,</p>
                <br></br>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;Welcome to the family list! This is a simple website put together to help with any Christmas / birthday / celebration lists. For any list where the user is added, they may add items for themselves. When others view this list afterwards, they can mark what they have purchased and allow others to see what is left available without the original user knowing. Now the tracking of what all has been purchased from someone's list can be tracked in one centralized location!</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;This is a labor of love, and is by no means some sleak and perfect site. Please be patient as I try to build this out and improve it as we go.</p>
                <br></br>
                <p>Thank you for your participation, and your patience!</p>
                <p>Ryan Spoonmore</p>
            </div>
        )
    }

    function loggedInPage() {
        const today = new Date();
        // Set the time to midnight for accurate date comparison
        today.setHours(0, 0, 0, 0);

        if (!lists || lists.length === 0) {
            return (
                <div id='start-page-container'>
                    <h1>Hello {currentUser?.firstName || currentUser?.firstname || currentUser?.email || 'User'}!</h1>
                    <div className='flex flex-col'>
                        <h3>You don't have any lists yet.</h3>
                    </div>
                </div>
            )
        }

        // Filter and sort the lists
        const futureEvents = lists
            .filter(list => new Date(list.eventdate) >= today)
            .sort((a, b) => new Date(a.eventdate) - new Date(b.eventdate)); // Ascending sort for future events

        const previousEvents = lists
            .filter(list => new Date(list.eventdate) < today)
            .sort((a, b) => new Date(b.eventdate) - new Date(a.eventdate)); // Descending sort for previous events

        const renderLinks = (listArray) => {
            if (listArray.length === 0) {
                return <p className="text-gray-500 italic">No events to display.</p>;
            }
            return (
                <ul className='p-10'>
                    {listArray.map(list => {
                        return (
                            <li key={`list-link-${list?.listid}`} className='underline decoration-solid'>
                                <Link to={`/lists/${Number(list?.listid)}`}>
                                    {list?.listName || list?.listname} - {new Date(list.eventdate).toLocaleDateString()}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            );
        };

        return (
            <div id='start-page-container'>
                <h1>Hello {currentUser?.firstName || currentUser?.firstname || currentUser?.email || 'User'}!</h1>
                <div className='flex flex-col'>
                    <h3>Future Events:</h3>
                    {renderLinks(futureEvents)}

                    <h3>Previous Events:</h3>
                    {renderLinks(previousEvents)}
                </div>
            </div>
        )
    }

    return currentUser ? loggedInPage() : welcomePage()
}

const StartPage = () => {
    return <PageShell mainView={StartPageView} />
}

export default StartPage