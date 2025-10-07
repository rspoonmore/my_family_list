import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ListProvider, ListContext } from '../../context/ListContext';
import PageShell from '../PageShell/PageShell';
import ListUserView from './ListUserView';
import ItemForm from '../Forms/ItemForm';

const ListContent = () => {
    const { listData, loadStateData, memberCrosswalk } = useContext(ListContext);
    const { listid } = useParams();
    const { currentUser, isInitialized } = useContext(AuthContext);
    const [outcome, setOutcome] = useState(null);
    const [showPurchased, setShowPurchased] = useState(false);
    const [showMyPurchased, setShowMyPurchased] = useState(false);
    const [pageLoaded, setPageLoaded] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;

    const renderOutcome = () => {
        if(!outcome?.message) return null;
        const className = outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{outcome.message}</div>
    };

    const loadPage = () => {
        if(!isInitialized) {
            // console.log('User is not initialized yet');
            setPageLoaded(false);
            return
        }

        try {
            fetch(`${apiUrl}/lists/${listid}?detailed=y`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
            .then(res => res.json())
            .then(res => {
                if(res?.success) {
                    loadStateData(res?.list || [])
                }
                else{
                    setOutcome(res);
                }
                setPageLoaded(true)
            })
        } catch(error) {
            console.error('Error creating list:', error);
            setOutcome({ success: false, message: 'Error Creating List' });
            return
        }
        
    };

    useEffect(loadPage, [isInitialized, currentUser, listid]);

    const renderShowMyCountButton = () => {
        if(!currentUser || !currentUser?.admin) return null;
        const changeShowMyPurchased = () => setShowMyPurchased(prev => !prev);
        const buttonDisplayText = showMyPurchased ? 'Hide My Counts' : 'Show My Counts';
        const className = 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded border border-gray-300';
        return <div><button className={className} onClick={changeShowMyPurchased}>{buttonDisplayText}</button></div>
    };

    const renderShowCountButton = () => {
        const changeShowPurchased = () => setShowPurchased(prev => !prev);
        const buttonDisplayText = showPurchased ? 'Hide Purchased Counts' : 'Show Purchased Counts';
        const className = 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded border border-gray-300';
        return <div><button className={className} onClick={changeShowPurchased}>{buttonDisplayText}</button></div>
    };

    const renderUserViews = () => {
        if(!listData?.users || listData?.users.length === 0) return null;
        return (
            <div className='flex flex-col'>
                {listData?.users.map(user => (
                    <ListUserView
                        key={`user-${user.userid}`} 
                        user={user}
                        membershipid={memberCrosswalk[Number(user.userid)]}
                        showPurchased={showPurchased}
                        showMyPurchased={showMyPurchased}
                    />
                ))}
            </div>
        )
    };

    const renderPage = () => {
        if(!isInitialized) {return <div className='text-4xl'>Content Loading...</div>}
        if(!pageLoaded) {
            return (
                <div className='p-5 m-5'>
                    Loading listid: {listid || 'null'}
                </div>
            )
        }
        if(!listData?.listName) {
            return (
                <div className='p-5 m-5'>
                    The list for this page (listid: {listid || 'null'}) does not exist. Please double check that you are accessing the correct link to view your list.
                </div>
            )
        }
        return (
            <div className='max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-lg'>
                <ItemForm />
                <h1><strong>List: </strong>{listData?.listName || ""}</h1>
                <h2><strong>Event Date: </strong>{listData?.eventDate || ""}</h2>
                <div className='flex gap-3 my-4'>
                    {renderShowMyCountButton()}
                    {renderShowCountButton()}
                </div>
                {renderOutcome()}
                {renderUserViews()}
            </div>
        )
    };

    return <PageShell mainView={renderPage} />
};

const ListView = () => {
    return (
        <ListProvider>
            <ListContent />
        </ListProvider>
    );
};

export default ListView;