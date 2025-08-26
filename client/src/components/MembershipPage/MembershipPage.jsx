import { useContext, useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import PageShell from '../PageShell/PageShell'

const MembershipPage = () => {
    const blankFormData = {'userid': '', 'startDate': null, 'endDate': null};
    const [formData, setFormData] = useState(blankFormData);
    const [outcome, setOutcome] = useState(null);
    const [updateAllowed, setUpdateAllowed] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [formType, setFormType] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [memberships, setMemberships] = useState(null);

    const { groupid } = useParams();
    const location = useLocation();

    const apiUrl = import.meta.env.VITE_API_URL;
    const { currentUser } = useContext(AuthContext)

    // Load page
    function loadPage() {
        if(!currentUser) {return setUpdateAllowed(false)}
        if(!currentUser.admin) {return setUpdateAllowed(false)}
        setUpdateAllowed(true);

        if(!location || !location.state || !location.state.memberships) {return setDataLoaded(false)}
        setDataLoaded(true);

        // Load memberships
        setMemberships(location.state.memberships);
        return;
    }

    // Show any API call outcomes
    function showOutcome() {
        if(!outcome) {return <></>}
        if(!outcome.message) {return <></>}
        const className = outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{outcome.message}</div>
    }

    // Update any entries in the form
    function updateFormData(key, e) {
        const newVal = (e === null) ? '' : e
        setFormData(prev => {
            let copy = {...prev};
            copy[key] = newVal;
            return copy;
        })
    }

    // Reset the form once submitted
    function clearInputs() {
        setFormType(null);
        setFormData(blankFormData);
    }

    // Populate form with user data
    function populateForm(membership) {
        updateFormData('userid', membership.userid)
        if(membership.startDate) {
            updateFormData('startDate', membership.startDate)
        }
        else if(membership.startdate) {
            updateFormData('startDate', membership.startdate)
        }
        if(membership.endDate) {
            updateFormData('endDate', membership.endDate)
        }
        else if(membership.enddate) {
            updateFormData('endDate', membership.enddate)
        }
    }

    // Submit form
    async function submit(e) {
        e.preventDefault();
        // Save form data in body of request
        const data = new FormData();
        data['groupid'] = Number(groupid);
        for(const key in formData) {
            data[key] = formData[key];
        }

        // Determine API call
        const url = `${apiUrl}/memberships/${formType == 'update' ? Number(membershipid) : ''}`;
        const method = formType == 'update' ? 'PUT' : 'POST';

        try {
            // Call API
            console.log(`${method} to ${url}: ${JSON.stringify(data)}`)

            // API Successful

            // API Unsuccessful 
        } catch(error) {
            setOutcome({
                'success': false,
                'message': error
            })
        }
    }

    // Membership Form
    function membershipForm() {
        if(!showForm) {return <></>}
        if(!formType) {return <></>}
        return (
            <div className='standard-form-container'>
                <span><strong>{formType == 'update' ? 'Update' : 'Register'} Membership</strong></span>
                {showOutcome()}
                <form className='standard-form' onSubmit={submit}>
                    <label htmlFor='userid'>User ID</label>
                    <input 
                        id='userid' 
                        name='userid' 
                        type='number' 
                        value={formData['userid']}
                        onChange={(e) => {updateFormData('userid', e.target.value)}}
                    required/>
                    <label htmlFor='startDate'>Start Date</label>
                    <input 
                        id='startDate' 
                        name='startDate' 
                        type='date' 
                        value={formData['startDate']}
                        onChange={(e) => {updateFormData('startDate', e.target.value)}}
                    required/>
                    <label htmlFor='endDate'>End Date</label>
                    <input 
                        id='endDate' 
                        name='endDate' 
                        type='date' 
                        value={formData['endDate']}
                        onChange={(e) => {updateFormData('endDate', e.target.value)}}
                    required/>
                    <div className='standard-form-btns'>
                        <button className='btn' type='button' onClick={clearInputs}>Clear</button>
                        <button className='btn' type='submit'>{formType == 'update' ? 'Update' : 'Register'} </button>
                    </div>
                </form>
            </div>
        )
    }

    // New Membership Button
    function newMembershipButton() {
        const onClick = () => {
            setFormType('register');
            setShowForm(true);
        }

        return <button className='btn' onClick={onClick}>Add New</button>
    }

    // Render Page
    function render() {
        if(!updateAllowed) {return <div>The current user does not have permission to view this page</div>}
        if(!dataLoaded) {return <div>The data needed for this page was not loaded properly</div>}

        // return view
        return (
            <div className='main-container'>
                <h1>Membership Page</h1>
                {newMembershipButton()}
                {membershipForm()}
            </div>
        )
    }

    useEffect(loadPage, [currentUser, location])

    return <PageShell mainView={render} />
}

export default MembershipPage;