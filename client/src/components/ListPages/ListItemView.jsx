import { useContext } from 'react';
import { ListContext } from '../../context/ListContext';

const ListItemView = ({userid=null, membershipid=null, item=null, showPurchased=false, isCurrentUser=false, isAdmin=false}) => {
    if(!item) {return null}
    if(!userid) {return null}
    if(!membershipid) {return null}
    const { updateForm, populateForm, setFormType } = useContext(ListContext);

    const renderLink = () => {
        if((item?.itemLink || item?.itemlink || "") === "") {return null}
        let link = item.itemLink || item.itemlink;
        if(link.slice(0, 4).toLowerCase() !== 'http') {
            link = 'http://' + link;
        }
        return (
            <div>
                <a className='text-sm underline text-green-600 hover:text-green-800 visited:text-purple-600' href={link} target='_blank' rel='noopener noreferrer'>Link</a>
            </div>
        )
    }

    const renderEditButton = () => {
        function onClick() {
            populateForm(item);
            updateForm('itemid', Number(item.itemid));
            updateForm('userid', Number(userid));
            updateForm('membershipid', Number(membershipid));
            setFormType('update');
        }

        const className = 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded border border-gray-300';
        return <button className={className} onClick={onClick}>Edit</button>
    }

    const renderBuyButton = () => {
        function onClick() {
            populateForm(item);
            updateForm('itemid', Number(item.itemid));
            updateForm('userid', Number(userid));
            updateForm('membershipid', Number(membershipid));
            setFormType('buy');
        }

        const className = 'bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded';
        return <button className={className} onClick={onClick}>Buy</button>
    }

    const renderButtonDiv = () => {
        if(isCurrentUser) {
            return (
                <div className='flex flex-col justify-center'>
                    {renderEditButton()}
                </div>
            )
        }
        if(isAdmin) {
            return (
                <div className='flex flex-col justify-center gap-2 flex-wrap'>
                    {renderEditButton()}
                    {renderBuyButton()}
                </div>
            )
        }
        return (
            <div className='flex flex-col justify-center'>
                {renderBuyButton()}
            </div>
        )
    }

    const renderPurchasedDiv = () => {
        const className = 'bg-gray-300 text-green-700 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap'
        if(!showPurchased) { 
            return (
                <div className={className}>Requested: {item.itemQtyReq}</div>
            )
        }
        return (
            <div className={className}>Bought: {item.itemQtyPurch}/{item.itemQtyReq}</div>
        )
    }

    const className = 'grid grid-cols-[5fr_2fr_1fr] border-b border-gray-100 py-3 gap-5 justify-content-center items-center'

    return (
        <div className={className}>
            <div className='flex flex-col'>
                <strong className='text-lg font-medium text-gray-800'>{item.itemName || ""}</strong>
                {renderLink()}
                <div className='text-sm'>{item.itemComments || ""}</div>
            </div>
            {renderPurchasedDiv()}
            {renderButtonDiv()}
        </div>
    )
}

export default ListItemView