import { useContext, useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell';
import ListUserView from './ListUserView';


const useListView = () => {
    const [outcome, setOutcome] = useState(null);
    const [showPurchased, setShowPurchased] = useState(false);
    const blankItemForm = {'membershipid': '', 'itemName': '', 'itemLink': '', 'itemComments': '', 'itemQtyReq': 0, 'itemQtyPuch': 0}
    const [formData, setFormData] = useState(blankItemForm);
    const [formType, setFormType] = useState(null);
    const {listid} = useParams();

    const renderOutcome = () => {
        if(!outcome?.message) {return <></>}
        const className = outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{outcome.message}</div>
    }

    const updateForm = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const populateForm = (item) => {
        setFormData(prev => ({
            ...prev,
            item
        }))
    }

    const clearForm = () => {
        setFormData(blankItemForm);
        setFormType(null);
    }

    return {setOutcome, renderOutcome, showPurchased, setShowPurchased, listid, formData, updateForm, populateForm, clearForm, formType}
}

const ListView = () => {
    const {setOutcome, renderOutcome, showPurchased, setShowPurchased, listid, formData, updateForm, populateForm, clearForm, formType} = useListView();

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

    const renderUserViews = () => {
        if(!pageState.listData?.users || pageState.listData?.users.length === 0) {return null}
        return (
            <div className='flex flex-col'>
                {pageState.listData?.users.map(user => {
                    return <ListUserView
                        key={`user-${user.userid}`} 
                        user={user}
                        membershipid={pageState.memberCrosswalk[Number(user.userid)]}
                        currentUser={currentUser}
                        showPurchased={showPurchased}
                        />
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
