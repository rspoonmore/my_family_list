import './AdminPage.css'
import { useContext, useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell'
import GroupView from '../Forms/GroupView'

const AdminPageView = () => {
    const [updateAllowed, setUpdateAllowed] = useState(true);
    // User states
    const [userLoadOutcome, setUserLoadOutcome] = useState(null);
    const [userData, setUserData] = useState(null);

    // Group states
    const [groupLoadOutcome, setGroupLoadOutcome] = useState(null);
    const [groupData, setGroupData] = useState(null); 
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [groupFormType, setGroupFormType] = useState('register');
    const [groupFormData, setGroupFormData] = useState(null);

    // Membership states
    const [membershipLoadOutcome, setMembershipLoadOutcome] = useState(null);
    const [membershipData, setMembershipData] = useState(null); 

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
        const catOptions = ['user', 'group', 'membership', 'list'];
        if(!catOptions.includes(category)) {return console.log(`Category of ${category} is not valid`)};

        let [catKey, setData, setOutcome] = [null, null]; 
        switch (category) {
            case 'user':
                [catKey, setData, setOutcome] = ['userid', setUserData, setUserLoadOutcome];
                break;
            case 'group':
                [catKey, setData, setOutcome] = ['groupid', setGroupData, setGroupLoadOutcome];
                break;
            case 'membership':
                [catKey, setData, setOutcome] = ['membershipid', setMembershipData, setMembershipLoadOutcome];
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
    const loadGroups = () => {
        try {
            console.log('Loading Groups')
            fetch(`${apiUrl}/groups`, {
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
                    if(res.groups) {setGroupData(res.groups)}
                }
                // update was not successful
                else {
                    setGroupLoadOutcome(res);
                }
            })
        } catch(error) {
            console.log(error)
        }
    }

    // Load Membership Data

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
        loadGroups();
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

        // Show group data
        const groupCardView = () => {
            if(!groupData) {return <></>}

            function groupCard(group) {
                function editButton() {
                    setGroupFormData(group);
                    setGroupFormType('update');
                    setShowGroupForm(true);
                }

                let groupMemberships = [];
                if(membershipData) {
                    groupMemberships = membershipData.filter(m => m.groupid === Number(group.groupid))
                }
                if(!groupMemberships || groupMemberships.length === 0) {
                    groupMemberships = [];
                }

                return (
                    <div key={`group-card-${group.groupid}`} className='section-card'>
                        <span className='card-title'>{group.groupname}</span>
                        <div className='card-detail-div'>
                            <span className='card-details'>ID: {group.groupid}</span>
                        </div>
                        <div className='card-button-div'>
                            <button className='btn btn-small' onClick={editButton}>Edit</button>
                            <button className='btn btn-small' onClick={deletePressed('group', group.groupid)}>Delete</button>
                            <Link className='btn btn-small' to={`/memberships/${group.groupid}`} state={{memberships: groupMemberships}}>Memberships</Link>
                        </div>
                    </div>
                )
            }

            return (
                <div className='section-card-container'>
                    {groupData.map(group => (groupCard(group)))}
                </div>
            )
        }

        // New Group button
        function newGroupButton() {
            function onClick() {
                setGroupFormType('register');
                setShowGroupForm(true);
            }

            return <button className='btn' onClick={onClick}>New Group</button>
        }


        return (
            <div className='admin-container'>
                <GroupView formType={groupFormType} prevGroupData={groupFormData} show={showGroupForm} setShow={setShowGroupForm} />    
                <div className='admin-section'>
                    <div><strong>Users</strong></div>
                    <Link to='/register' className='btn'>New User</Link>
                    {sectionOutcomes({sectionOutcome: userLoadOutcome})}
                    {userCardView()}
                </div>

                <div className='admin-section'>
                    <div><strong>Groups</strong></div>
                    {newGroupButton()}
                    {sectionOutcomes({sectionOutcome: groupLoadOutcome})}
                    {groupCardView()}
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