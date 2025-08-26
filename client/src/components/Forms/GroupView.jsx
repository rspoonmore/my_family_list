import { useState, useEffect } from 'react'

const GroupView = ({formType = 'register', prevGroupData = null, show = false, setShow = null}) => {
    const [groupName, setGroupName] = useState('');
    const [outcome, setOutcome] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    // custom failure message setter
    function setFailureMessage(message) {
        setOutcome({
            'success': false,
            'message': message
        })
    }

    // close form on submission or cancel
    function closeForm() {
        setGroupName('');
        setOutcome(null);
        if(setShow) {
            setShow(false);
        }
    }

    // Show outcome banner
    const showErrors = () => {
        if(!outcome) {return <></>}
        if(outcome.success) {return <></>}
        if(!outcome.message) {return <></>}
        return <div className='error-simple'>{outcome.message}</div>
    }

    // load data if edit page
    function setupForm() {
        if(formType == 'register') {
            setGroupName('');
            return;
        }
        if(!prevGroupData) {return setFailureMessage('formType was not register and the previous group data is empty')}
        if(!prevGroupData.groupid) {return setFailureMessage('Missing group id')}
        if(prevGroupData.groupName) {
            setGroupName(prevGroupData.groupName);
        }
        else if(prevGroupData.groupname) {
            setGroupName(prevGroupData.groupname);
        }
        else {
            return setFailureMessage('No groupName or groupname in prevGroupData');
        }
        setOutcome(null);
        return;
    }

    // submit group
    async function submit(e) {
        e.preventDefault();
        try {
            // Save data in body of request
            const data = new FormData();
            data['groupName'] = groupName;

            // Edit form
            if(formType === 'update') {
                console.log('Updating Group')
                await fetch(`${apiUrl}/groups/${Number(prevGroupData.groupid)}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(data)
                })
                .then(res => res.json())
                .then(res => {
                    // update successful
                    if(res.success) {
                        setOutcome(res);
                        closeForm();
                        window.location.reload();
                    }
                    // update was not successful
                    else {
                        setOutcome(res);
                    }
                })
            }

            // Register Form
            else {
                console.log('Registering Group');
                await fetch(`${apiUrl}/groups`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(data)
                })
                .then(res => res.json())
                .then(res => {
                    // update successful
                    if(res.success) {
                        setOutcome(res);
                        closeForm();
                        window.location.reload();
                    }
                    // update was not successful
                    else {
                        setOutcome(res);
                    }
                })
            }
            
        } catch (error) {
            setFailureMessage(error);
        }
    }

    // Cancel
    function cancelPressed() {
        closeForm();
    }

    // Create Form
    function groupForm() {
        if(!show) {return <></>}
        return (
        <div className={'pop-up'}>
            <span><strong>{formType === 'register' ? 'New' : 'Update'} Group</strong></span>
            {showErrors()}
            <form className='standard-form' onSubmit={submit}>
                <label htmlFor='groupName'>Group Name</label>
                <input 
                    id='groupName' 
                    name='groupName' 
                    type='text' 
                    value={groupName}
                    onChange={(e) => {setGroupName(e.target.value)}}
                required/>
                <div className='standard-form-btns'>
                    <button className='btn btn-small' type='button' onClick={cancelPressed}>Cancel</button>
                    <button className='btn btn-small' type='submit'>{formType === 'register' ? 'Register' : 'Update'}</button>
                </div>
            </form>
        </div>
    )
    }

    useEffect(setupForm, [formType])

    return groupForm();
}

export default GroupView