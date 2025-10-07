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
        const baseClass = 'p-3 mb-4 rounded-md font-medium text-sm border';
        const successClass = 'bg-green-100 text-green-700 border-green-200';
        const errorClass = 'bg-red-100 text-red-700 border-red-200';
        
        const className = outcome.success ? `${baseClass} ${successClass}` : `${baseClass} ${errorClass}`;
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

    const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
    const primaryButtonClass = 'px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-700 hover:bg-green-900 transition-colors shadow-md';
    const secondaryButtonClass = 'px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors';

    const getPotentialUsers = () => {
        if (!currentUser?.admin) {return []}
        try {
            // console.log('Loading Users');
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
        // console.log('Loading list')
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
        // console.log('Editing list')
        try {
            const response = await fetch(`${apiUrl}/lists/${listid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({...formData})
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
        // console.log('Creating new membership for userid: ', userid)
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
        // console.log('Deleting membership for userid: ', membershipid)
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

    // Edit List Details Form
    const renderListDetailsForm = () => {
        return (
            <form className='standard-form border-1 m-4 px-2 py-10 rounded-sm' onSubmit={editList}>
                <fieldset className='flex flex-col space-y-4 p-4 border border-gray-200 rounded-lg'>
                    <legend className='px-2 text-lg font-semibold text-gray-700'>List Details</legend>
                    
                    <label htmlFor='listName' className='block text-sm font-medium text-gray-700'>List Name</label>
                    <input 
                        id='listName'
                        name='listName'
                        type='text'
                        value={formData.listName}
                        onChange={(e) => {updateFormData('listName', e)}}
                        className={inputClass}
                        required 
                    />
                    
                    <label htmlFor='eventDate' className='block text-sm font-medium text-gray-700'>Event Date</label>
                    <input 
                        id='eventDate'
                        name='eventDate'
                        type='date'
                        value={formData.eventDate}
                        onChange={(e) => {updateFormData('eventDate', e)}}
                        className={inputClass}
                        required 
                    />
                    
                    <div className='flex justify-end space-x-3 pt-4 border-t'>
                        <button className={secondaryButtonClass} type='button' onClick={clearForm}>Clear</button>
                        <button className={primaryButtonClass} type='submit'>Update Details</button>
                    </div>
                </fieldset>
            </form>
        )
    }

    // Edit Membership Section
    const renderMembershipEditSection = () => {
        return (
            <fieldset className='p-4 border border-gray-200 rounded-lg'>
                <MembershipEditForm
                    potentialUsers={pageState.potentialUsers}
                    members={members}
                    newUserChoice={newUserChoice}
                    setNewUserChoice={setNewUserChoice}
                    onAdd={addMembership}
                    onDelete={deleteMembership}
                />
            </fieldset>
        )
    }

    const renderPage = () => {
        if(!pageState.isAllowed) {return <div>The Current User is not allowed to create a new list.</div>}

        return (
            // Main card container
            <div className='max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-lg mt-10 space-y-6'>
                <h1 className='text-3xl font-extrabold text-gray-900 mb-6'>Edit List</h1>
                {renderOutcome()}
                <div className='flex flex-col space-y-6'>
                    {renderListDetailsForm()}
                    {renderMembershipEditSection()}
                </div>
            </div>
        )
    }

    return <PageShell mainView={renderPage} />
}

export default ListUpdatePage;