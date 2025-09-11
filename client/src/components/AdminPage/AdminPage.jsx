import './AdminPage.css'
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
    const { currentUser } = useContext(AuthContext);

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

        // Check that current user is allowed to make the update
        const isAdmin = currentUser?.admin;
        setUpdateAllowed(isAdmin || false);
        if(!isAdmin) {return null}

        loadUsers();
        loadLists();
    }

    // Generate View
    const generateView = () => {
        if(!updateAllowed) {return <div>You are not an admin, and therefore cannot access this page.</div>}

        // Show user data
        const userCardView = () => {
            if(!userData) {return <></>}

            function userCard(user) {
                return (
                    <div key={`user-card-${user.userid}`} className='section-card'>
                        <span className='card-title'>{user.email}</span>
                        <div className='card-detail-div'>
                            <span className='card-details'>ID: {user.userid}</span>
                            <span className='card-details'>Name: {user.firstname} {user.lastname}</span>
                            <span className='card-details'>Admin: {user.admin ? 'Yes' : 'No'}</span>
                        </div>
                        <div className='card-button-div'>
                            <Link className='btn btn-small' to={`/users/${user.userid}/update`} state={{user}}>Edit</Link>
                            <button className='btn btn-small' onClick={deletePressed('user', user.userid)}>Delete</button>
                        </div>
                    </div>
                )
            }

            return (
                <div className='section-card-container'>
                    {userData.map(user => (userCard(user)))}
                </div>
            )
        }

        // Show list data
        const listCardView = () => {
            if(!listData) {return <></>}

            function listCard(list) {
                return (
                    <div key={`list-card-${list.listid}`} className='section-card'>
                        <span className='card-title'>{list.listName || list.listname}</span>
                        <div className='card-detail-div'>
                            <span className='card-details'>ID: {list.listid}</span>
                            <span className='card-details'>Event Date: {list.eventDate || list.eventdate}</span>
                        </div>
                        <div className='card-button-div'>
                            <Link className='btn btn-small' to={`/lists/${list.listid}/update`}>Edit</Link>
                            <button className='btn btn-small' onClick={deletePressed('list', list.listid)}>Delete</button>
                        </div>
                    </div>
                )
            }

            return (
                <div className='section-card-container'>
                    {listData.map(list => (listCard(list)))}
                </div>
            )
        }


        return (
            <div className='admin-container'> 
                <div className='admin-section'>
                    <div><strong>Users</strong></div>
                    <Link to='/register' className='btn'>New User</Link>
                    {sectionOutcomes({sectionOutcome: userLoadOutcome})}
                    {userCardView()}
                </div>

                <div className='admin-section'>
                    <div><strong>Lists</strong></div>
                    <Link to='/lists/register' className='btn'>New List</Link>
                    {sectionOutcomes({sectionOutcome: listLoadOutcome})}
                    {listCardView()}
                </div>
            </div>
        )
        

    }

    // useEffect to load all data 
    useEffect(loadPage, [currentUser])

    return <PageShell mainView={generateView} />;
};

export default AdminPage;