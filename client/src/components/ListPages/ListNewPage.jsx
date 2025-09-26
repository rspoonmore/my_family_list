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
        const baseClass = 'p-3 mb-4 rounded-md font-medium text-sm border';
        const successClass = 'bg-green-100 text-green-700 border-green-200';
        const errorClass = 'bg-red-100 text-red-700 border-red-200';
        
        const className = outcome.success ? `${baseClass} ${successClass}` : `${baseClass} ${errorClass}`;
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

    const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
    const primaryButtonClass = 'px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-700 hover:bg-green-900 transition-colors shadow-md';
    const secondaryButtonClass = 'px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors';


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
    const handleSubmit = async (e) => {
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
            // Main card container
            <div className='max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-lg mt-10'>
                <h1 className='text-3xl font-extrabold text-gray-900 mb-6'>Create New List</h1>
                {renderOutcome()}
                
                <form className='flex flex-col space-y-6' onSubmit={handleSubmit}>
                    
                    {/* List Details Fieldset */}
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
                    </fieldset>
                    
                    {/* Membership Management Fieldset */}
                    <fieldset className='p-4 border border-gray-200 rounded-lg'>
                        <MembershipAddForm
                            potentialUsers={pageState.potentialUsers}
                            members={members}
                            addMember={addMember}
                            deleteMember={deleteMember}
                            newUserChoice={newUserChoice}
                            setNewUserChoice={setNewUserChoice}
                        />
                    </fieldset>
                    
                    {/* Buttons */}
                    <div className='flex justify-end space-x-3 pt-4 border-t'>
                        <button className={secondaryButtonClass} type='button' onClick={clearForm}>Clear</button>
                        <button className={primaryButtonClass} type='submit'>Register List</button>
                    </div>
                </form>
            </div>
        )
    }

    const renderPage = () => {
        if(!pageState.isAllowed) {return <div className='p-8 text-center text-red-600'>The Current User is not allowed to create a new list.</div>}

        return (
            <div className='max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-lg mt-10 space-y-6'>
                {renderForm()}
            </div>
        )
    }

    return <PageShell mainView={renderPage} />
}

export default ListNewPage;