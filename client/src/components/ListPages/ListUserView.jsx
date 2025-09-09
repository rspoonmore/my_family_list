import ListItemView from './ListItemView';

const ListUserView = ({user=null, membershipid=null, currentUser=null, showPurchased=false}) => {
    if(!user) {return null}
    if(!membershipid) {return null}
    const showPurchasedSetting = (!currentUser || Number(currentUser.userid) !== Number(user.userid) || showPurchased);
    const isCurrentUserSetting = currentUser && Number(currentUser.userid) === Number(user.userid)
    
    const renderAddItemButton = () => {
        if(!currentUser.admin && Number(currentUser.userid) !== Number(user.userid)) {return null}
        return <button className='btn'>Add Item</button>
    }

    return (
        <div className='flex flex-col m-5'>
            <div className='flex gap-3'>
                <strong>{user.userName || user.email || "Unnamed User"}</strong>
                {renderAddItemButton()}
            </div>
            {user.items.map(item => {
                return <ListItemView 
                    key={`item-view-${item.itemid}`} 
                    item={item} 
                    showPurchased={showPurchasedSetting} 
                    isCurrentUser={isCurrentUserSetting} 
                    isAdmin={!!(currentUser?.admin)}
                    />
            })}
        </div>
    )
}

export default ListUserView