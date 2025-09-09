import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FormProvider, FormContext } from '../../context/ItemFormContext';
import PageShell from '../PageShell/PageShell';
import ListUserView from './ListUserView';
import ItemForm from '../Forms/ItemForm';

const ListContent = () => {
    const { formState, updateForm, clearForm, populateForm, setFormType } = useContext(FormContext);
    const { listid } = useParams();
    const { currentUser } = useContext(AuthContext);

    const [outcome, setOutcome] = useState(null);
    const [showPurchased, setShowPurchased] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;
    const [pageState, setPageState] = useState({
        'listDataRaw': [],
        'listData': {},
        'memberCrosswalk': {}
    });

    const renderOutcome = () => {
        if(!outcome?.message) return null;
        const className = outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{outcome.message}</div>
    };

    const loadList = async () => {
        if (!currentUser?.admin) return null;
        console.log('Loading list');
        try {
            const response = await fetch(`${apiUrl}/lists/${listid}?detailed=y`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
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
            console.error('Error creating list:', error);
            return setOutcome({ success: false, message: 'Error Creating List' });
        }
    };

    const processListData = (listRows) => {
        if(listRows.length === 0) return {};
        let newMemberCrosswalk = {};
        let data = {};
        data['listName'] = listRows[0]?.listname || '';
        data['listid'] = listRows[0]?.listid || '';
        data['eventDate'] = listRows[0]?.eventdate || '';
        data['users'] = [];
        listRows.forEach(row => {
            if(!data?.users.some(user => user.userid === Number(row.userid))) { 
                data.users.push({
                    'userid': Number(row.userid), 
                    'userName': `${row.firstname || ''} ${row.lastname || ''}`,
                    'email': row.email || '',
                    'items': []
                })
                newMemberCrosswalk[Number(row.userid)] = Number(row.membershipid)
            }
            if(row.itemid) {
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
        if(!pageState.listData?.users || pageState.listData?.users.length === 0) return null;
        return (
            <div className='flex flex-col'>
                {pageState.listData?.users.map(user => (
                    <ListUserView
                        key={`user-${user.userid}`} 
                        user={user}
                        membershipid={pageState.memberCrosswalk[Number(user.userid)]}
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
                <h1><strong>List: </strong>{pageState?.listData?.listName || ""}</h1>
                <h2><strong>Event Date: </strong>{pageState?.listData?.eventDate || ""}</h2>
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
        <FormProvider>
            <ListContent />
        </FormProvider>
    );
};

export default ListView;