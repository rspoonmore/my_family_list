import { useContext } from 'react';
import { ListContext } from '../../context/ListContext';

const ListItemView = ({listid=null, userid=null, item=null, showPurchased=false, isCurrentUser=false, isAdmin=false}) => {
    if(!item) {return null}
    if(!listid) {return null}
    if(!userid) {return null}
    const { formType, updateForm, clearForm, populateForm, setFormType } = useContext(ListContext);

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
            setFormType('update');
        }

        return <button className='btn btn-small' onClick={onClick}>Edit</button>
    }

    const renderBuyButton = () => {
        function onClick() {
            populateForm(item);
            setFormType('buy');
        }

        return <button className='btn btn-small' onClick={onClick}>Buy</button>
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
                <div className='flex flex-col justify-center gap-2'>
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
        if(!showPurchased) { 
            return (
                <div className='text-xs font-light bg-gray-300 px-2 py-3 rounded-sm'>Requested: {item.itemQtyReq}</div>
            )
        }
        return (
            <div className='text-xs font-light bg-gray-300 px-2 py-3 rounded-sm'>Bought: {item.itemQtyPurch}/{item.itemQtyReq}</div>
        )
    }

    const className = 'grid grid-cols-[5fr_2fr_1fr] m-3 gap-5 justify-content-center items-center'

    return (
        <div className={className}>
            <div className='flex flex-col'>
                <strong>{item.itemName || ""}</strong>
                {renderLink()}
                <div className='text-sm'>{item.itemComments || ""}</div>
            </div>
            {renderPurchasedDiv()}
            {renderButtonDiv()}
        </div>
    )
}

export default ListItemView