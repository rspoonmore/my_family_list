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

        const baseClass = 'p-3 mb-4 rounded-md font-medium text-sm';
        const successClass = 'bg-green-100 text-green-700 border border-green-200';
        const errorClass = 'bg-red-100 text-red-700 border border-red-200';
        
        const className = state.outcome.success ? `${baseClass} ${successClass}` : `${baseClass} ${errorClass}`;

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
    
    // Base classes for form inputs
    const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
    const labelClass = 'block text-sm font-medium text-gray-700 mt-2';

    return (
        <PageShell
            mainView={() => (
                <div className='max-w-md mx-auto p-8 bg-white shadow-xl rounded-lg mt-10'>
                    <h1 className='text-2xl font-bold text-gray-900 mb-6'>Change Password</h1>
                    {renderOutcome()}
                    <form className='space-y-4' onSubmit={updatePassword}>
                        {/* Only render old password field if the user is not an admin */}
                        {!currentUser?.admin && (
                            <>
                                <label htmlFor='oldPassword' className={labelClass}>Old Password</label>
                                <input
                                    id='oldPassword'
                                    name='oldPassword'
                                    type='password'
                                    value={state.formData.oldPassword}
                                    onChange={handleInputChange}
                                    className={inputClass}
                                    required
                                />
                            </>
                        )}
                        <label htmlFor='newPassword' className={labelClass}>New Password</label>
                        <input
                            id='newPassword'
                            name='newPassword'
                            type='password'
                            value={state.formData.newPassword}
                            onChange={handleInputChange}
                            className={inputClass}
                            required
                        />
                        <label htmlFor='confirmPassword' className={labelClass}>Confirm Password</label>
                        <input
                            id='confirmPassword'
                            name='confirmPassword'
                            type='password'
                            value={state.formData.confirmPassword}
                            onChange={handleInputChange}
                            className={inputClass}
                            required
                        />
                        <div className='flex justify-end gap-3 pt-4'>
                            <button className='px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300' type='button' onClick={clearForm}>Clear</button>
                            <button className='px-4 py-2 text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-900 shadow-md transition-colors' type='submit'>Update</button>
                        </div>
                    </form>
                </div>
            )}
        />
    );
};

export default ChangePasswordView;