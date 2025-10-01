import { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell'

const AdminPage = () => {
    const [updateAllowed, setUpdateAllowed] = useState(true);
    // User states
    const [userLoadOutcome, setUserLoadOutcome] = useState(null);
    const [userData, setUserData] = useState(null);

    // List states
    const [listLoadOutcome, setListLoadOutcome] = useState(null);
    const [listData, setListData] = useState(null); 

    const apiUrl = import.meta.env.VITE_API_URL;
    const { currentUser, isInitialized } = useContext(AuthContext);

    // Show section outcome
    const sectionOutcomes = ({sectionOutcome = null}) => {
        if(!sectionOutcome) {return <></>}
        if(!sectionOutcome.message) {return <></>}
        const className = sectionOutcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{sectionOutcome.message}</div>
    }

    // Delete pushed
    const deletePressed = (category, id) => async () => {
        // Check that category is valid
        const catOptions = ['user', 'list'];
        if(!catOptions.includes(category)) {return console.log(`Category of ${category} is not valid`)};

        const catKey = catOptions === 'user' ? 'userid' : 'listid';
        const setData = catOptions === 'user' ? setUserData : setListData;
        const setOutcome = catOptions === 'user' ? setUserLoadOutcome : setListLoadOutcome;

        // Confirm delete
        if(window.confirm(`Are you sure you want to delete ${catKey}: ${id} from ${category}s?`)) {
            // call delete function
            console.log(`Deleting ${catKey}: ${id} from ${category}s.`)
            await fetch(`${apiUrl}/${category}s/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(res => res.json())
            .then(res => {
                //successful
                if(res.success) {
                    // delete from view as well
                    setData(prev => {return [...prev].filter(entry => entry[catKey] != id)})
                }
                else if (res.message) {
                    setOutcome(res)
                }
            })
        }
    }

    // Load User Data
    const loadUsers = () => {
        try {
            console.log('Loading Users')
            fetch(`${apiUrl}/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            .then(res => res.json())
            .then(res => {
                // successful
                if(res.success) {
                    setUserData(res.users || [])
                }
                // update was not successful
                else {
                    setUserLoadOutcome(res);
                }
            })
        } catch(error) {
            console.log(error)
        }
    }

    // Load List Data
    const loadLists = () => {
        try {
            console.log('Loading Lists')
            fetch(`${apiUrl}/lists`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            .then(res => res.json())
            .then(res => {
                // successful
                if(res.success) {
                    setListData(res.lists || [])
                }
                // update was not successful
                else {
                    setListLoadOutcome(res);
                }
            })
        } catch(error) {
            console.log(error)
        }
    }

    // Check if user is an admin, if so, load data
    const loadPage = () => {
        console.log('Loading Page');

        if(!isInitialized) {
            console.log('User is not initialized yet');
            return
        }

        // Check that current user is allowed to make the update
        const isAdmin = currentUser?.admin;
        setUpdateAllowed(isAdmin || false);
        if(!isAdmin) {return null}

        loadUsers();
        loadLists();
    }

    // Generate View
    function generateView() {
        // if(!isInitialized) {return <div className='p-10 text-center'>Loading application...</div>;}
        if(!isInitialized) {return <div className='text-4xl'>Content Loading...</div>}
        if(!updateAllowed) {return <div className="p-8 text-lg text-red-600">You are not an admin, and therefore cannot access this page.</div>}

        const cardContainerClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
        const cardClassName = 'bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg border border-gray-100';
        const titleClassName = 'text-xl font-semibold text-green-700 truncate block mb-3';
        const detailSectionClassName = 'space-y-1 text-sm text-gray-600 mb-4';
        const buttonSectionClassName = 'flex flex-wrap gap-2 pt-4 border-t border-gray-100';
        const buttonClassName = 'px-3 py-1 text-xs font-medium rounded-full bg-green-700 text-white hover:bg-indigo-600';
        
        // Show user data
        const userCardView = () => {
            if(!userData) {return <></>}

            function userCard(user) {
                return (
                    <div key={`user-card-${user.userid}`} className={cardClassName}>
                        <span className={titleClassName}>{user.email}</span>
                        <div className={detailSectionClassName}>
                            <span className='block'>ID: {user.userid}</span>
                            <span className='block'>Name: {user.firstname} {user.lastname}</span>
                            <span className='block'>Admin: {user.admin ? 'Yes' : 'No'}</span>
                        </div>
                        <div className={buttonSectionClassName}>
                            <Link className={buttonClassName} to={`/users/${user.userid}/update`} state={{user}}>Edit</Link>
                            <Link className={buttonClassName} to={`/users/${user.userid}/password`}>Password</Link>
                            <button className={buttonClassName} onClick={deletePressed('user', user.userid)}>Delete</button>
                        </div>
                    </div>
                )
            }

            return (
                <div className={cardContainerClassName}>
                    {userData.map(user => (userCard(user)))}
                </div>
            )
        }

        // Show list data
        const listCardView = () => {
            if(!listData) {return <></>}

            function listCard(list) {
                return (
                    <div key={`list-card-${list.listid}`} className={cardClassName}>
                        <span className={titleClassName}>{list.listName || list.listname}</span>
                        <div className={detailSectionClassName}>
                            <span className='block'>ID: {list.listid}</span>
                            <span className='block'>Event Date: {list.eventDate || list.eventdate}</span>
                        </div>
                        <div className={buttonSectionClassName}>
                            <Link className={buttonClassName} to={`/lists/${list.listid}/update`}>Edit</Link>
                            <button className={buttonClassName} onClick={deletePressed('list', list.listid)}>Delete</button>
                        </div>
                    </div>
                )
            }

            return (
                <div className={cardContainerClassName}>
                    {listData.map(list => (listCard(list)))}
                </div>
            )
        }


        const sectionClassName = 'mb-12 border-b border-gray-200 pb-6';
        const newButtonClassName = 'px-4 py-2 text-sm font-medium rounded-lg bg-green-700 text-white hover:bg-green-900 transition-colors';
        return (
            <div className='max-w-6xl mx-auto px-4 py-8'> 
                <div className={sectionClassName}>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-2xl font-bold text-gray-800'>Users</h2>
                        <Link to='/register' className={newButtonClassName}>New User</Link>
                    </div>
                    {sectionOutcomes({sectionOutcome: userLoadOutcome})}
                    {userCardView()}
                </div>

                <div className={sectionClassName}>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-2xl font-bold text-gray-800'>Lists</h2>
                        <Link to='/lists/register' className={newButtonClassName}>New List</Link>
                    </div>
                    {sectionOutcomes({sectionOutcome: listLoadOutcome})}
                    {listCardView()}
                </div>
            </div>
        )
        

    }

    // useEffect to load all data 
    useEffect(() => {loadPage()}, [currentUser])

    return <PageShell mainView={generateView} />;
};

export default AdminPage;