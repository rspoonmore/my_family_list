import { useContext, useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell';
import ListItemView from './ListItemView';
import { Link } from 'react-router-dom';

const useListView = () => {
    const [outcome, setOutcome] = useState(null);
    const [showPurchased, setShowPurchased] = useState(false);
    const [memberCrosswalk, setMemberCrosswalk] = useState({});
    const {listid} = useParams();

    const renderOutcome = () => {
        if(!outcome?.message) {return <></>}
        const className = outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{outcome.message}</div>
    }

    return {setOutcome, renderOutcome, showPurchased, setShowPurchased, listid}
}

const ListView = () => {
    const {setOutcome, renderOutcome, showPurchased, setShowPurchased, listid} = useListView();

    const apiUrl = import.meta.env.VITE_API_URL;
    const { currentUser } = useContext(AuthContext);
    const [pageState, setPageState] = useState({
        'listDataRaw': [],
        'listData': {},
        'memberCrosswalk': {}
    })

    // Load the List from API call
    const loadList = async () => {
        if (!currentUser?.admin) {return null}
        console.log('Loading list')
        try {
            const response = await fetch(`${apiUrl}/lists/${listid}?detailed=y`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const res = await response.json();
            
            if(res?.success) {
                return setPageState(prev => {
                    let newState = {...prev};
                    const processedData = processListData(res?.list || []);
                    newState['listDataRaw'] = res?.list || [];
                    newState['listData'] = processedData.data || {};
                    newState['memberCrosswalk'] = processedData.memberCrosswalk || {};
                    return newState;
                })
            }
            
            return setOutcome(res);

        } catch(error) {
            // Log the error and return a failure object.
            console.error('Error creating list:', error);
            return setOutcome({ success: false, message: 'Error Creating List' });
        }
    }

    const processListData = (listRows) => {
        if(listRows.length === 0) {return {}}
        let newMemberCrosswalk = {};
        let data = {};
        data['listName'] = listRows[0]?.listname || '';
        data['listid'] = listRows[0]?.listid || '';
        data['eventDate'] = listRows[0]?.eventdate || '';
        data['users'] = [];
        listRows.forEach(row => {
            if(!data?.users.some(user => user.userid === Number(row.userid))) { 
                // New User
                data.users.push({
                    'userid': Number(row.userid), 
                    'userName': `${row.firstname || ''} ${row.lastname || ''}`,
                    'email': row.email || '',
                    'items': []
                })
                newMemberCrosswalk[Number(row.userid)] = Number(row.membershipid)
            }
            if(row.itemid) {
                // User has items
                const user = data?.users.find(user => user.userid === Number(row.userid));
                if (user) {
                    user.items = [...user.items, {
                        'itemid': Number(row.itemid),
                        'itemName': row.itemName || row.itemname || '',
                        'itemLink': row.itemLink || row.itemlink || '',
                        'itemComments': row.itemComments || row.itemcomments || '',
                        'itemQtyReq': Number(row.itemqtyreq || row.itemQtyReq || 0),
                        'itemQtyPurch': Number(row.itemqtypurch || row.itemQtyPurch || 0)
                    }]
                }
            }
        })
        return {'data': data, 'memberCrosswalk': newMemberCrosswalk}
    }

    const loadPage = () => {
        loadList();
    }

    useEffect(loadPage, [currentUser])

    const renderShowCountButton = () => {
        if(!currentUser || !currentUser.admin) {return null};

        const changeShowPurchased = () => {
            setShowPurchased(prev => (!prev))
        };

        const buttonDisplayText = showPurchased ? 'Hide My Counts' : 'Show My Counts';

        return <div><button className='btn' onClick={changeShowPurchased}>{buttonDisplayText}</button></div>
    }

    const renderAddItemButton = (userid) => {
        if(!userid) {return null};
        const membershipid = pageState.memberCrosswalk[Number(userid)];
        if(!membershipid) {return null};
        return <Link className='btn' to={`/items/new?membershipid=${membershipid}`}>Add Item</Link>
    }

    const UserView = ({user}) => {
        const showPurchasedSetting = (!currentUser || Number(currentUser.userid) !== Number(user.userid) || showPurchased);
        const isCurrentUserSetting = currentUser && Number(currentUser.userid) === Number(user.userid)
        const addItemButton = () => {
            if(!currentUser) {return null}
            if(!currentUser.admin && Number(currentUser.userid) !== Number(user.userid)) {return null}
            return renderAddItemButton(Number(user.userid))
        }

        return (
            <div key={`user-${user.userid}`} className='flex flex-col m-5'>
                <div className='flex gap-3'>
                    <strong>{user.userName || user.email || "Unnamed User"}</strong>
                    {addItemButton()}
                </div>
                {user.items.map(item => {
                    return <ListItemView 
                        key={`item-view-${item.itemid}`} 
                        item={item} 
                        showPurchased={showPurchasedSetting} 
                        isCurrentUser={isCurrentUserSetting} 
                        isAdmin={!!(currentUser?.admin)}
                        />
                })}
            </div>
        )
    }

    const renderUserViews = () => {
        if(!pageState.listData?.users || pageState.listData?.users.length === 0) {return null}
        return (
            <div className='flex flex-col'>
                {pageState.listData?.users.map(user => {
                    return UserView({user})
                })}
            </div>
        )
    }

    const renderPage = () => {
        return (
            <div className='flex flex-col p-5 m-5'>
                <h1><strong>List: </strong>{pageState?.listData?.listName || ""}</h1>
                <h2><strong>Event Date: </strong>{pageState?.listData?.eventDate || ""}</h2>
                {renderShowCountButton()}
                {renderOutcome()}
                {renderUserViews()}
            </div>
        )
    }

    return <PageShell mainView={renderPage} />
}

export default ListView
