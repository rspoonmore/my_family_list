import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext'
import MembershipAddForm from './MembershipAddForm';
import PageShell from '../PageShell/PageShell';

const useListPage = () => {
    const blankFormData = {'listName': '', 'eventDate': ''};
    const [formData, setFormData] = useState(blankFormData);
    const [members, setMembers] = useState([]);
    const [outcome, setOutcome] = useState(null);
    const [newUserChoice, setNewUserChoice] = useState("-1: ");

    const updateFormData = (key, e) => {
        setFormData(prev => ({
            ...prev,
            [key]: e.target.value
        }))
    }

    const addMember = (memberData) => {
        setMembers(prev => ([...prev, memberData]))
    };

    const deleteMember = (deleteUserID) => {
        setMembers(prev => ([...prev].filter(user => Number(user.userid) != Number(deleteUserID))))
    }

    const renderOutcome = () => {
        if(!outcome?.message) {return <></>}
        const className = outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{outcome.message}</div>
    }

    const clearForm = () => {
        setFormData(blankFormData);
        setMembers([]);
    }

    const clearOutcome = () => {
        setOutcome(null);
    }

    return {formData, updateFormData, setOutcome, renderOutcome, clearForm, clearOutcome, members, addMember, deleteMember, newUserChoice, setNewUserChoice}
}



const ListNewPage = () => {
    const {formData, updateFormData, setOutcome, renderOutcome, clearForm, clearOutcome, members, addMember, deleteMember, newUserChoice, setNewUserChoice} = useListPage();
    
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

    const loadPage = () => {
        getPotentialUsers();
        setPageState(prev => ({
            ...prev,
            isAllowed: !!currentUser?.admin
        }))
    }

    useEffect(loadPage, [currentUser])

    // Create the List API call from the form data
    const createList = async () => {
        console.log('Creating new list')
        const listData = {...formData};

        try {
            const response = await fetch(`${apiUrl}/lists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(listData)
            });

            const res = await response.json();
            
            return res;

        } catch(error) {
            // Log the error and return a failure object.
            console.error('Error creating list:', error);
            return { success: false, message: 'Error Creating List' };
        }
    }

    // Create all Membership API calls from form data
    const addMemberships = async (listid) => {
        console.log('Creating new memberships')
        const memberships = [...members];
        for(let i=0; i < memberships.length; i++) {
            const membershipCurr = memberships[i];
            let membershipData = {'listid': listid, 'userid': membershipCurr.userid};
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
                
                if(!res.success) {
                    return { success: false, message: 'Error Creating Membership' };
                }

            } catch(error) {
                // Log the error and return a failure object.
                console.error('Error creating membership:', error);
                return { success: false, message: 'Error Creating Membership' };
            }
        }
        
        console.log('memberships added:', memberships);
        setOutcome({'success': true, 'message': 'Your list has been created successfully!-'})
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

    // New List Form
    const renderForm = () => {
        return (
            <div className='standard-form-container border-2 m-5'>
                <h1>Register a New List</h1>
                {renderOutcome()}
                <form className='standard-form' onSubmit={submitForm}>
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
                    <fieldset className='standard-form-container'>
                        <MembershipAddForm
                            potentialUsers={pageState.potentialUsers}
                            members={members}
                            addMember={addMember}
                            deleteMember={deleteMember}
                            newUserChoice={newUserChoice}
                            setNewUserChoice={setNewUserChoice}
                        />
                    </fieldset>
                    <div className='standard-form-btns'>
                        <button className='btn' type='button' onClick={clearForm}>Clear</button>
                        <button className='btn' type='submit'>Register</button>
                    </div>
                </form>
            </div>
        )
    }

    const renderPage = () => {
        if(!pageState.isAllowed) {return <div>The Current User is not allowed to create a new list.</div>}

        return (
            <div>
                {renderForm()}
            </div>
        )
    }

    return <PageShell mainView={renderPage} />
}

export default ListNewPage;