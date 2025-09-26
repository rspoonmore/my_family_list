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
            <div className='max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-lg mt-10 text-center'>
                <h1 className='text-3xl font-bold text-gray-900 mb-6'>Hello!</h1>
                <p className='text-lg text-gray-700 leading-relaxed'>
                    Welcome to the family list! This is a simple website put together to help with any Christmas / birthday / celebration lists. For any list where the user is added, they may add items for themselves. When others view this list afterwards, they can mark items as purchased.
                </p>
            </div>
        )
    }

    function loggedInPage() {
        // Prepare and sort lists
        const futureEvents = [];
        const previousEvents = [];
        const currentDate = new Date();

        lists?.forEach(list => {
            const eventDate = new Date(list.eventdate);
            if (eventDate >= currentDate) {
                futureEvents.push(list);
            } else {
                previousEvents.push(list);
            }
        });

        futureEvents.sort((a, b) => new Date(a.eventdate) - new Date(b.eventdate)); // Ascending sort for future events
        previousEvents.sort((a, b) => new Date(b.eventdate) - new Date(a.eventdate)); // Descending sort for previous events

        const renderLinks = (listArray) => {
            if (listArray.length === 0) {
                return <p className="text-gray-500 italic p-2">No events to display.</p>;
            }
            return (
                <div className='space-y-3'>
                    {listArray.map(list => {
                        const dateString = new Date(list.eventdate).toLocaleDateString();
                        return (
                            <div 
                                key={`list-link-${list?.listid}`} 
                                className='bg-gray-50 hover:bg-indigo-50 border border-gray-200 p-4 rounded-lg shadow-sm transition-colors duration-200'
                            >
                                <Link to={`/lists/${Number(list?.listid)}`} className='flex justify-between items-center w-full'>
                                    <span className='text-lg font-medium text-green-700 hover:text-green-900 mr-8'>
                                        {list?.listName || list?.listname}
                                    </span>
                                    <span className='text-sm text-gray-600 font-medium'>
                                        {dateString}
                                    </span>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            );
        };

        return (
            // Main container for logged-in user dashboard
            <div className='max-w-4xl mx-auto px-4 py-8'>
                <h1 className='text-4xl font-extrabold text-gray-900 mb-8'>Hello {currentUser?.firstName || currentUser?.firstname || currentUser?.email || 'User'}!</h1>
                
                <div className='space-y-12'>
                    
                    <div className='border-b border-gray-200 pb-6'>
                        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Future Events</h2>
                        {renderLinks(futureEvents)}
                    </div>

                    <div className=''>
                        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Previous Events</h2>
                        {renderLinks(previousEvents)}
                    </div>

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