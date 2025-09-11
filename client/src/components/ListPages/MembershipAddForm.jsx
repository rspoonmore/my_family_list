const MembershipAddForm = ({potentialUsers, members, addMember, deleteMember, newUserChoice, setNewUserChoice}) => {
    // Potential Users Dropdown
    const renderPotentialUsersDropdown = () => {
        const handleChange = (e) => {
            setNewUserChoice(e.target.value);
        }

        return (
            <div className='flex items-center gap-5'>
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
            const newUserEmail = newUserData[1].trim();

            // Make sure a valid member was chosen
            if(newUserID < 0) {return}

            // Make sure user doesn't already have a membership
            for(let i = 0; i < members.length; i++) {
                if(members[i].userid === newUserID) {
                    setNewUserChoice("-1: ");
                    return;
                }
            }

            addMember({'userid': newUserID, 'email': newUserEmail});
            setNewUserChoice("-1: ");
        }

        return <button type='button' className='btn btn-small' onClick={onClick}>Add</button>
    }

    // Delete user from membership button
    const deleteUserButton = (user) => {
        const onClick = () => {
            deleteMember(user.userid)
            setNewUserChoice("-1: ");
        }

        return <button type='button' className='btn btn-small' onClick={onClick}>Delete</button>
    }

    // cell of already added member
    const renderUserCell = (user) => {
        return (
            <div key={`user-cell-${user.userid}`} >
                <div className='grid grid-cols-2 items-center m-2 g-2'>
                    <div>
                        <span>{`${user.userid}: ${user.email}`}</span>
                    </div>
                    <div className='justify-self-end'>
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
            <div className='flex flex-col divide-y-1 border-2'>
                {members.map(user => renderUserCell(user))}
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-2'>
            <h1>Add Users to List</h1>
            {renderUsersView()}
            {renderPotentialUsersDropdown()}
        </div>
    )
}

export default MembershipAddForm;