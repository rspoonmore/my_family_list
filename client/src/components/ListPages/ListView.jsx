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
    const { currentUser } = useContext(AuthContext);
    const [outcome, setOutcome] = useState(null);
    const [showPurchased, setShowPurchased] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;

    const renderOutcome = () => {
        if(!outcome?.message) return null;
        const className = outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{outcome.message}</div>
    };

    const loadList = async () => {
        try {
            const response = await fetch(`${apiUrl}/lists/${listid}?detailed=y`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const res = await response.json();
            if(res?.success) {
                loadStateData(res?.list || []);
                return
            }
            return setOutcome(res);
        } catch(error) {
            console.error('Error creating list:', error);
            return setOutcome({ success: false, message: 'Error Creating List' });
        }
    };

    const loadPage = () => {
        loadList();
    };

    useEffect(loadPage, [currentUser, listid]);

    const renderShowCountButton = () => {
        if(!currentUser || !currentUser.admin) return null;
        const changeShowPurchased = () => setShowPurchased(prev => !prev);
        const buttonDisplayText = showPurchased ? 'Hide My Counts' : 'Show My Counts';
        return <div><button className='btn' onClick={changeShowPurchased}>{buttonDisplayText}</button></div>
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
                    />
                ))}
            </div>
        )
    };

    const renderPage = () => {
        return (
            <div className='flex flex-col p-5 m-5'>
                <ItemForm />
                <h1><strong>List: </strong>{listData?.listName || ""}</h1>
                <h2><strong>Event Date: </strong>{listData?.eventDate || ""}</h2>
                {renderShowCountButton()}
                {renderOutcome()}
                {renderUserViews()}
            </div>
        )
    };

    return <PageShell mainView={renderPage} />
};

// This is the main exported component
const ListView = () => {
    return (
        <ListProvider>
            <ListContent />
        </ListProvider>
    );
};

export default ListView;