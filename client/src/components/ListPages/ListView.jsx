import { useContext, useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell';

const useListView = () => {
    const [outcome, setOutcome] = useState(null);
    const {listid} = useParams();

    const renderOutcome = () => {
        if(!outcome?.message) {return <></>}
        const className = outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{outcome.message}</div>
    }

    return {setOutcome, renderOutcome, listid}
}

const ListView = () => {
    const {setOutcome, renderOutcome, listid} = useListView();

    const apiUrl = import.meta.env.VITE_API_URL;
    const { currentUser } = useContext(AuthContext);
    const [pageState, setPageState] = useState({
        'listData': [],
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
                return processListData(res?.list || [])
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
            }
            if(row.itemid) {
                // User has items
                const user = data?.users.find(user => user.userid === Number(row.userid));
                if (user) {
                    user.items = [...user.items, {
                        'itemid': Number(row.itemid),
                        'itemName': row.itemName || '',
                        'itemLink': row.itemlink || '',
                        'itemComments': row.itemcomments || '',
                        'itemQtyReq': Number(row.itemqtyreq || 0),
                        'itemQtyPurch': Number(row.itemqtypurch || 0)
                    }]
                }
            }
        })
        return setPageState(prev => ({...prev, listData: data}))
    }

    const loadPage = () => {
        loadList();
    }

    useEffect(loadPage, [currentUser])

    const renderPage = () => {
        return (
            <div className='flex flex-col p-5 m-5'>
                <h1>List</h1>
                {renderOutcome()}
                <div>{JSON.stringify(pageState?.listData || [])}</div>
            </div>
        )
    }

    return <PageShell mainView={renderPage} />
}

export default ListView
