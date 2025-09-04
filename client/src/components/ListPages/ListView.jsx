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
                setPageState(prev => ({
                    ...prev,
                    listData: res?.list || []
                }))
                return null;
            }
            
            return setOutcome(res);

        } catch(error) {
            // Log the error and return a failure object.
            console.error('Error creating list:', error);
            return setOutcome({ success: false, message: 'Error Creating List' });
        }
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
