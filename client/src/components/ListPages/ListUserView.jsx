import ListItemView from './ListItemView';
import { useContext } from 'react';
import { ListContext } from '../../context/ListContext';
import { AuthContext } from '../../context/AuthContext';


const ListUserView = ({user=null, membershipid=null, showPurchased=false}) => {
    if(!user) return null;
    if(!membershipid) return null;
    
    const { formType, updateForm, clearForm, populateForm, setFormType } = useContext(ListContext);
    const { currentUser } = useContext(AuthContext);

    const showPurchasedSetting = (!currentUser || Number(currentUser.userid) !== Number(user.userid) || showPurchased);
    const isCurrentUserSetting = currentUser && Number(currentUser.userid) === Number(user.userid);

    const renderAddItemButton = () => {
        if(!currentUser?.admin && Number(currentUser?.userid) !== Number(user.userid)) return null;

        const onClick = () => {
            updateForm('userid', Number(user.userid));
            updateForm('membershipid', Number(membershipid));
            setFormType('new');
        };

        return <button className='btn' onClick={onClick}>Add Item</button>;
    };

    return (
        <div className='flex flex-col m-5'>
            <div className='flex gap-3'>
                <strong>{user.userName || user.email || "Unnamed User"}</strong>
                {renderAddItemButton()}
            </div>
            {user.items.map(item => {
                return <ListItemView 
                    key={`item-view-${item.itemid}`} 
                    userid={Number(user.userid)}
                    membershipid={Number(membershipid)}
                    item={{...item, 'membershipid': Number(membershipid)}} 
                    showPurchased={showPurchasedSetting} 
                    isCurrentUser={isCurrentUserSetting} 
                    isAdmin={!!(currentUser?.admin)}
                />;
            })}
        </div>
    );
};

export default ListUserView;