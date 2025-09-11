import { useContext, useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
import MembershipEditForm from './MembershipEditForm';
import PageShell from '../PageShell/PageShell';

const useListPage = () => {
    const blankFormData = {'listName': '', 'eventDate': ''};
    const [formData, setFormData] = useState(blankFormData);
    const [members, setMembers] = useState([]);
    const [outcome, setOutcome] = useState(null);
    const [newUserChoice, setNewUserChoice] = useState("-1: ");
    const {listid} = useParams();

    const updateFormData = (key, e) => {
        setFormData(prev => ({
            ...prev,
            [key]: e?.target?.value || e
        }))
    }

    const renderOutcome = () => {
        if(!outcome?.message) {return <></>}
        const className = outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{outcome.message}</div>
    }

    const addMember = (memberData) => {
        setMembers(prev => ([...prev, memberData]))
    };

    const deleteMember = (deleteUserID) => {
        setMembers(prev => ([...prev].filter(user => Number(user.userid) != Number(deleteUserID))))
    }

    const clearForm = () => {
        setFormData(blankFormData);
        setMembers([]);
    }

    const clearOutcome = () => {
        setOutcome(null);
    }

    return {formData, updateFormData, setOutcome, renderOutcome, clearForm, clearOutcome, newUserChoice, setNewUserChoice, listid, members, setMembers}
}



const ListUpdatePage = () => {
    const {formData, updateFormData, setOutcome, renderOutcome, clearForm, clearOutcome, newUserChoice, setNewUserChoice, listid, members, setMembers} = useListPage();
    
    const apiUrl = import.meta.env.VITE_API_URL;
    const { currentUser } = useContext(AuthContext);
    const [pageState, setPageState] = useState({
        'isAllowed': false,
        'potentialUsers': []
    })

    const getPotentialUsers = () => {
        if (!currentUser?.admin) {return []}
        try {
            console.log('Loading Users');
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
                    setPageState(prev => ({
                        ...prev,
                        potentialUsers: res.users || []
                    }))
                }
                // update was not successful
                else {
                    setOutcome(res);
                }
            })
        } catch(error) {
            console.log(error)
        }
    }

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
                updateFormData('listName', res?.list[0]?.listname || '');
                updateFormData('eventDate', res?.list[0]?.eventdate || '');
                let newMemberData = [];
                res?.list?.forEach(membership => {
                    newMemberData.push({'membershipid': Number(membership.membershipid), 'userid': Number(membership.userid), 'email': membership.email})
                })
                setMembers(newMemberData);
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
        getPotentialUsers();
        loadList();
        setPageState(prev => ({
            ...prev,
            isAllowed: !!currentUser?.admin
        }))
    }

    useEffect(loadPage, [currentUser])

    // Create the List API call from the form data
    const editList = async () => {
        console.log('Editing list')
        const listData = {...formData};

        try {
            const response = await fetch(`${apiUrl}/lists/${listid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(listData)
            });

            const res = await response.json();
            
            return setOutcome(res);

        } catch(error) {
            // Log the error and return a failure object.
            console.error('Error creating list:', error);
            return setOutcome({ success: false, message: 'Error Creating List' });
        }
    }

    // Create a Membership from toggled user
    const addMembership = async (userid) => {
        console.log('Creating new membership for userid: ', userid)
        const membershipData = {'listid': Number(listid), 'userid': Number(userid)};
        try {
            const response = await fetch(`${apiUrl}/memberships`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(membershipData)
            });

            const res = await response.json();
            if(res?.success) {
                loadPage();
            }
            return setOutcome(res);

        } catch(error) {
            // Log the error and return a failure object.
            console.error('Error creating membership:', error);
            return setOutcome({ success: false, message: 'Error Creating Membership' });
        }
    }

    // Delete a Membership
    const deleteMembership = async (membershipid) => {
        console.log('Deleting membership for userid: ', membershipid)
        try {
            const response = await fetch(`${apiUrl}/memberships/${membershipid}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const res = await response.json();
            if(res?.success) {
                loadPage();
            }
            return setOutcome(res);

        } catch(error) {
            // Log the error and return a failure object.
            console.error('Error deleting membership:', error);
            return setOutcome({ success: false, message: 'Error Deleting Membership' });
        }
    }

    // Submit both API calls from form data
    const submitForm = async (e) => {
        e.preventDefault();
        console.log('Submitting Form');

        const listResult = await createList();

        if(listResult?.success && listResult?.list?.listid) {
            const membersResult = await addMemberships(Number(listResult.list.listid));

            console.log(JSON.stringify(membersResult));
        } else {
            // Handle the case where list creation failed.
            setOutcome(listResult); // This assumes setOutcome is available.
        }
        
        clearForm()
    }

    // Edit List Details Form
    const renderListDetailsForm = () => {
        return (
            <form className='standard-form border-1 m-4 px-2 py-10 rounded-sm' onSubmit={editList}>
                <fieldset className='standard-form-container'>
                    <label htmlFor='listName'>List Name</label>
                    <input
                        id='listName'
                        name='listName'
                        type='text'
                        value={formData.listName}
                        onChange={(e) => {updateFormData('listName', e)}}
                        required 
                    />
                    <label htmlFor='eventDate'>Event Date</label>
                    <input
                        id='eventDate'
                        name='eventDate'
                        type='date'
                        value={formData.eventDate}
                        onChange={(e) => {updateFormData('eventDate', e)}}
                        required 
                    />
                </fieldset>
                <div className='standard-form-btns'>
                    <button className='btn' type='button' onClick={clearForm}>Clear</button>
                    <button className='btn' type='submit'>Edit</button>
                </div>
            </form>
        )
    }

    // Edit Membership Section
    const renderMembershipEditSection = () => {
        return (
            <div className='flex flex-col border-1 m-4 px-2 py-10 rounded-sm'>
                <MembershipEditForm
                    potentialUsers={pageState.potentialUsers}
                    members={members}
                    newUserChoice={newUserChoice}
                    setNewUserChoice={setNewUserChoice}
                    onAdd={addMembership}
                    onDelete={deleteMembership}
                />
            </div>
        )
    }

    const renderPage = () => {
        if(!pageState.isAllowed) {return <div>The Current User is not allowed to create a new list.</div>}

        return (
            <div className='flex flex-col p-5 border-2 m-5'>
                <h1>Edit List</h1>
                {renderOutcome()}
                {renderListDetailsForm()}
                {renderMembershipEditSection()}
            </div>
        )
    }

    return <PageShell mainView={renderPage} />
}

export default ListUpdatePage;