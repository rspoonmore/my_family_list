const MembershipEditForm = ({potentialUsers, members, newUserChoice, setNewUserChoice, onAdd, onDelete}) => {
    const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
    const primaryButtonClass = 'px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-700 hover:bg-green-900 transition-colors shadow-md';
    const dangerButtonClass = 'px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md';
    
    // Potential Users Dropdown
    const renderPotentialUsersDropdown = () => {
        const handleChange = (e) => {
            setNewUserChoice(e.target.value);
        }

        return (
            <div className='flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                <select
                    name='user-select'
                    value={newUserChoice}
                    onChange={handleChange}
                >
                    <option value="-1">Select a user</option>
                    {potentialUsers.map((user) => (
                        <option key={user.userid} value={`${user.userid}: ${user.email}`}>
                            {user.email}
                        </option>
                    ))}
                </select>
                {addUserButton()}
            </div>
        )
    }

    // Add user to membership button
    const addUserButton = () => {
        const onClick = () => {
            const newUserData = newUserChoice.split(':');
            const newUserID = Number(newUserData[0].trim());

            // Make sure a valid member was chosen
            if(newUserID < 0) {return}

            // Make sure user doesn't already have a membership
            for(let i = 0; i < members.length; i++) {
                if(members[i].userid === newUserID) {
                    setNewUserChoice("-1: ");
                    return;
                }
            }
            onAdd(newUserID);
            setNewUserChoice("-1: ");
        }

        return <button type='button' className={primaryButtonClass} onClick={onClick}>Add</button>
    }

    // Delete user from membership button
    const deleteUserButton = (user) => {
        const onClick = () => {
            onDelete(Number(user.membershipid))
            setNewUserChoice("-1: ");
        }

        return <button type='button' className={dangerButtonClass} onClick={onClick}>Delete</button>
    }

    // cell of already added member
    const renderUserCell = (user) => {
        return (
            <div key={`user-cell-${user.userid}`} className='py-2 px-3 hover:bg-indigo-50 transition-colors'>
                <div className='flex justify-between items-center'>
                    <span className='font-medium text-gray-700'>{`${user.userid}: ${user.email}`}</span>
                    <div className='flex-none'>
                        {deleteUserButton(user)}
                    </div>
                </div>
            </div>
        )
    }

    // Render users already added
    const renderUsersView = () => {
        if(members.length === 0) {return null}
        return (
            <div className='flex flex-col border border-gray-300 rounded-lg divide-y divide-gray-200 mt-2 max-h-60 overflow-y-auto'>
                {members.map(user => renderUserCell(user))}
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-4'>
            <h2 className='text-xl font-semibold text-gray-800 border-b pb-2'>Manage List Members</h2>
            {renderUsersView()}
            {renderPotentialUsersDropdown()}
        </div>
    )
}

export default MembershipEditForm;