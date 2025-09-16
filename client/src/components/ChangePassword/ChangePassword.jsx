import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import PageShell from '../PageShell/PageShell';

const ChangePasswordView = () => {
    const blankFormData = { 'oldPassword': '', 'newPassword': '', 'confirmPassword': '' };
    const [state, setState] = useState({
        updateAllowed: false,
        formData: blankFormData,
        outcome: null,
    });

    const { userid } = useParams();
    const { currentUser } = useContext(AuthContext);
    const apiUrl = import.meta.env.VITE_API_URL;

    // Use a single handler for all form inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            formData: {
                ...prevState.formData,
                [name]: value,
            },
        }));
    };

    // Show outcome of update attempt
    const renderOutcome = () => {
        if (!state.outcome || !state.outcome.message) {
            return null;
        }
        const className = state.outcome.success ? 'success-large' : 'error-large';
        return <div className={className}>{state.outcome.message}</div>;
    };

    const clearForm = () => {
        setState(prevState => ({
            ...prevState,
            formData: blankFormData,
        }));
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        const { formData } = state;
        
        // Validation checks
        if (formData.newPassword !== formData.confirmPassword) {
            setState(prevState => ({ ...prevState, outcome: { success: false, message: 'New passwords do not match.' } }));
            return;
        }

        if (!currentUser?.admin && formData.newPassword === formData.oldPassword) {
            setState(prevState => ({ ...prevState, outcome: { success: false, message: 'New password must be different from old password.' } }));
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/users/${Number(userid)}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            const res = await response.json();
            
            setState(prevState => ({ ...prevState, outcome: res }));
            
            if (res.success) {
                clearForm();
            }
        } catch (error) {
            console.error(error);
            setState(prevState => ({ ...prevState, outcome: { success: false, message: 'An error occurred.' } }));
        }
    };
    
    // Check permissions and update state
    useEffect(() => {
        console.log('Loading Form');
        const isAllowed = currentUser && (currentUser?.admin || currentUser.userid === Number(userid));
        setState(prevState => ({ ...prevState, updateAllowed: isAllowed }));
    }, [currentUser, userid]);

    // Render logic
    if (!state.updateAllowed) {
        return (
            <PageShell
                mainView={() => <div>You do not have permission to change the password for this user</div>}
            />
        );
    }
    
    return (
        <PageShell
            mainView={() => (
                <div className='standard-form-container'>
                    <h1>Change Password</h1>
                    {renderOutcome()}
                    <form className='standard-form' onSubmit={updatePassword}>
                        {/* Only render old password field if the user is not an admin */}
                        {!currentUser?.admin && (
                            <>
                                <label htmlFor='oldPassword'>Old Password</label>
                                <input
                                    id='oldPassword'
                                    name='oldPassword'
                                    type='password'
                                    value={state.formData.oldPassword}
                                    onChange={handleInputChange}
                                    required
                                />
                            </>
                        )}
                        <label htmlFor='newPassword'>New Password</label>
                        <input
                            id='newPassword'
                            name='newPassword'
                            type='password'
                            value={state.formData.newPassword}
                            onChange={handleInputChange}
                            required
                        />
                        <label htmlFor='confirmPassword'>Confirm Password</label>
                        <input
                            id='confirmPassword'
                            name='confirmPassword'
                            type='password'
                            value={state.formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                        />
                        <div className='standard-form-btns'>
                            <button className='btn' type='button' onClick={clearForm}>Clear</button>
                            <button className='btn' type='submit'>Update</button>
                        </div>
                    </form>
                </div>
            )}
        />
    );
};

export default ChangePasswordView;