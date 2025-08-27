import { useContext, useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell'

const useMembershipForm = () => {
    const blankFormData = {'userid': '', 'startDate': '', 'endDate': ''};
    const [formData, setFormData] = useState(blankFormData);
    const [outcome, setOutcome] = useState(null);
    const [formType, setFormType] = useState(null);

    // Reset the form once submitted
    function clearInputs() {
        setFormData(blankFormData);
        setOutcome(null);
    }

    // Updates a specific form field.
    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Populates the form for editing an existing membership.
    const populateForm = (membership) => {
        setFormData({
        userid: membership.userid || '',
        startDate: membership.startDate || membership.startdate || '',
        endDate: membership.endDate || membership.enddate || '',
        });
        setFormType('update');
    };

    return {formData, setFormData, outcome, setOutcome, formType, setFormType, clearInputs, updateFormData, populateForm}
}

const MembershipPage = () => {
    const [pageState, setPageState] = useState({
        updateAllowed: false,
        dataLoaded: false,
        showForm: false,
        editingMembership: null,
        memberships: null,
        groupname: null
    });
    const { groupid } = useParams();
    const location = useLocation();
    const apiUrl = import.meta.env.VITE_API_URL;
    const { currentUser } = useContext(AuthContext)

    const {
        formData,
        outcome, 
        setOutcome, 
        formType, 
        setFormType, 
        clearInputs, 
        updateFormData, 
        populateForm
    } = useMembershipForm();

    // Show form based on button type
    const handleShowForm = ({type = 'register', membership = null}) => {
        setFormType(type);
        if(type === 'update'){
            populateForm(membership);
            setPageState(prev => ({...prev, editingMembership: membership?.membershipid}))
        }
    }

    // Submit form
    async function submit(e) {
        e.preventDefault();
        setOutcome(null);

        // Save form data in body of request
        const data = {...formData, groupid: Number(groupid)};

        // Determine API call
        const url = `${apiUrl}/memberships/${formType == 'update' ? Number(pageState.editingMembership) : ''}`;
        const method = formType == 'update' ? 'PUT' : 'POST';

        try {
            // Call API
            console.log(`${method} to ${url}: ${JSON.stringify(data)}`)
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(data),
                credentials: 'include'
            });
            
            const result = await response.json();

            if(result?.success) {
                // API Successful
                setOutcome({ success: true, message: result.message || 'API successful'});
                setFormType(null);
                clearInputs();
                loadPage();
            } else {
                // API Unsuccessful 
                setOutcome({ success: false, message: result.message || 'API unsuccessful'})
            }
            
        } catch(error) {
            setOutcome({
                'success': false,
                'message': error
            })
        }
    }

    // Delete form
    async function handleDelete(membership) {
        if(!membership.membershipid) {return null}
        if(!window.confirm('Are you sure you want to delete this membership?')) {return null}
        try {    
            const response = await fetch(`${apiUrl}/memberships/${membership.membershipid}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json'},
                credentials: 'include'
            });

            const result = await response.json();

            if(result?.success) {
                // API Successful
                setOutcome({ success: true, message: result.message || 'API successful'});
                loadPage();
            } else {
                // API Unsuccessful 
                setOutcome({ success: false, message: result.message || 'API unsuccessful'})
            }
        } catch(error) {
            console.log(error)
        }
    }

    // Load page
    const loadPage = () => {
        setPageState({
            updateAllowed: currentUser?.admin,
            dataLoaded: !!(location?.state?.groupname),
            memberships: null,
            groupname: location?.state?.groupname || null
        })

        let memberships = [];
        if(currentUser?.admin) {
            fetch(`${apiUrl}/memberships/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json'},
                credentials: 'include'
            })
            .then(res => res.json())
            .then(res => {
                memberships = res?.memberships?.filter(m => m.groupid === Number(groupid));
                setPageState(prev => ({...prev, memberships: memberships}))
            })
        }
    }

    useEffect(loadPage, [currentUser, location])

    // Show any API call outcomes
    function renderOutcome() {
        if(!outcome) {return <></>}
        const className = outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{outcome.message || 'Error with no outcome message'}</div>
    }


    // Membership Form
    function renderMembershipForm() {
        if(!formType) {return null}

        return (
            <div className='pop-up'>
                <span><strong>{formType == 'update' ? 'Update' : 'Register'} Membership</strong></span>
                
                <form className='standard-form' onSubmit={submit}>
                    <label htmlFor='userid'>User ID</label>
                    <input 
                        id='userid' 
                        name='userid' 
                        type='number' 
                        value={formData.userid}
                        onChange={(e) => {updateFormData('userid', e.target.value)}}
                        required
                    />
                    <label htmlFor='startDate'>Start Date</label>
                    <input 
                        id='startDate' 
                        name='startDate' 
                        type='date' 
                        value={formData.startDate}
                        onChange={(e) => {updateFormData('startDate', e.target.value)}}
                        required
                    />
                    <label htmlFor='endDate'>End Date</label>
                    <input 
                        id='endDate' 
                        name='endDate' 
                        type='date' 
                        value={formData.endDate}
                        onChange={(e) => {updateFormData('endDate', e.target.value)}}
                        required
                    />
                    <div className='standard-form-btns'>
                        <button className='btn' type='button' onClick={clearInputs}>Clear</button>
                        <button className='btn' type='submit'>{formType == 'update' ? 'Update' : 'Register'} </button>
                    </div>
                </form>
            </div>
        )
    }

    // Add New Button
    const renderAddNewButton = () => {
        const onClick = formType ? () => {
            setFormType(null) 
            clearInputs()
        } : () => handleShowForm({type: 'register'});
        const buttonText = formType ? 'Cancel' : 'Add New';
        
        return <button className='btn' onClick={onClick}>{buttonText}</button>
    }

    // Show current memberships
    const renderMemberships = () => {
        if(!pageState.memberships) {return null}
        const membershipRow = (membership) => {
            return (
                <tr key={`membership-row-${membership.membershipid}`}>
                    <td>{membership.membershipid}</td>
                    <td>{membership.userid}</td>
                    <td>{membership.email}</td>
                    <td>{membership.startdate}</td>
                    <td>{membership.enddate}</td>
                    <td><button className='btn btn-small' onClick={() => {handleShowForm({ type: 'update', membership })}}>Edit</button></td>
                    <td><button className='btn btn-small' onClick={() => {handleDelete(membership)}}>Delete</button></td>
                    
                </tr>
            )
        }

        return (
            <table className='standard-table'>
                <thead>
                    <tr>
                        <th>Membership ID</th>
                        <th>User ID</th>
                        <th>Email</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                    </tr>
                </thead>
                <tbody>
                    {pageState.memberships.map(m => membershipRow(m))}
                </tbody>
            </table>
        )
    }

    // Render Page
    function renderContent() {
        if(!pageState.updateAllowed) {return <div>The current user does not have permission to view this page</div>}
        if(!pageState.dataLoaded) {return <div>The data needed for this page was not loaded properly</div>}

        // return view
        return (
            <div className='main-container max-w-full overflow-x-auto p-5'>
                <h1>Membership Page for <strong>{pageState.groupname}</strong></h1>
                {renderOutcome()}
                {renderAddNewButton()}
                {renderMembershipForm()}
                {renderMemberships()}
            </div>
        )
    }

    return <PageShell mainView={renderContent} />
}

export default MembershipPage;