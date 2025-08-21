import './AdminPage.css'
import { useContext, useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell'

const AdminPageView = () => {
    const [updateAllowed, setUpdateAllowed] = useState(true);
    // User states
    const [userLoadOutcome, setUserLoadOutcome] = useState(null);
    const [userData, setUserData] = useState(null);

    // Group states
    const [groupLoadOutcome, setGroupLoadOutcome] = useState(null);
    const [groupData, setGroupData] = useState(null); 

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
        const catOptions = ['user', 'group', 'list'];
        if(!catOptions.includes(category)) {return console.log(`Category of ${category} is not valid`)};

        let [catKey, setData, setOutcome] = [null, null]; 
        switch (category) {
            case 'user':
                [catKey, setData, setOutcome] = ['userid', setUserData, setUserLoadOutcome];
                break;
            case 'group':
                [catKey, setData, setOutcome] = ['groupid', setGroupData, setGroupLoadOutcome];
                break;
            case 'list':
                [catKey, setData, setOutcome] = ['listid', setListData, setListLoadOutcome];
                break;
            default:
                [catKey, setData, setOutcome] = [null, null, null]; 
        }

        // Check valid results of switch
        if(!catKey) {return console.log(`No catKey was created`)};
        if(!setData) {return console.log(`No setData was created`)};
        if(!setOutcome) {return console.log(`No setOutcome was created`)};

        // Confirm delete
        if(window.confirm(`Are you sure you want to delete ${catKey}: ${id} from ${category}s?`)) {
            // call delete function
            console.log(`Deleting ${catKey}: ${id} from ${category}s.`)
            await fetch(`${apiUrl}/${category}s/${id}`, {
                method: 'DELETE',
                headers : {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            .then(res => res.json())
            .then(res => {
                //successful
                if(res.success) {
                    if(res[`${category}s`]) {setData(res[`${category}s`])}
                }
                else if (res.message) {
                    setOutcome(res)
                }
            })
            
            // delete from view as well
            setData(prev => {return [...prev].filter(entry => entry[catKey] != id)})
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
                    if(res.users) {setUserData(res.users)}
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

    // Load Group Data

    // Load List Data

    // Check if user is an admin, if so, load data
    const loadPage = () => {
        console.log('Loading Page');
        // Check that current user exists
        if(!currentUser) {
            setUpdateAllowed(false)
            return;
        }
        // Check that current user is allowed to make the update
        if(!currentUser.admin) {
            setUpdateAllowed(false);
            return;
        }

        loadUsers();
    }

    // Generate View
    const generateView = () => {
        if(!updateAllowed) {return <div>You are not an admin, and therefore cannot access this page.</div>}

        // Show user data
        const userDataView = () => {
            if(!userData) {return <></>}

            const userTableRow = (user) => {
                return (
                    <tr key={`userid-table-row-${user.userid}`}>
                        <td>{user.userid}</td>
                        <td>{user.email}</td>
                        <td>{user.firstname}</td>
                        <td>{user.lastname}</td>
                        <td>{user.admin ? 'Yes' : 'No'}</td>
                        <td><Link className='btn' to={`/users/${user.userid}/update`}>Edit</Link></td>
                        <td><button className='btn' onClick={deletePressed('user', user.userid)}>Delete</button></td>
                    </tr>
                )
            }

            return (
                <table>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Email</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Admin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userData.map(user => (userTableRow(user)))}
                    </tbody>
                </table>
            )
        }


        return (
            <div className='admin-container'>
                <div className='admin-section'>
                    <div><strong>Users</strong></div>
                    {sectionOutcomes({sectionOutcome: userLoadOutcome})}
                    {userDataView()}
                </div>
            </div>
        )
        

    }

    // useEffect to load all data 
    useEffect(loadPage, [currentUser])

    return generateView();



};

const AdminPage = () => {
    return <PageShell mainView={AdminPageView} />
};

export default AdminPage;