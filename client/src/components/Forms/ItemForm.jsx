import { useContext } from 'react';
import { ListContext } from '../../context/ListContext';

const ItemForm = () => {
    const { formType, formData, updateForm, clearForm, addItem, updateItem, deleteItem } = useContext(ListContext);
    if(!formType) {return null}
    if(!formData) {return null}

    const onSubmit = async (e) => {
        e.preventDefault();
        console.log('formType: ', formType, '\nformData: ', formData);
        let method = '';
        let reactCleanerFunction = null;
        if(formType === 'new') {
            method = 'POST';
            reactCleanerFunction = addItem;
        } else if(formType === 'update' || formType === 'buy') {
            method = 'PUT';
            reactCleanerFunction = updateItem;
        } else {
            return window.alert('There was an issue with the form submission. The formType was not valid.')
        }

        // API Request
        
        // API returns item
        const returnedItem = formType === 'new' ? {'itemid': 200, 'itemname': formData.itemName, 'itemlink': formData.itemLink, 'itemcomments': formData.itemComments, 'itemqtyreq': formData.itemQtyReq} : formData;
        const updatedItem = {item: {...returnedItem, 'userid': Number(formData.userid)}}
        reactCleanerFunction(updatedItem)
        clearForm();
    }

    const deleteButton = () => {
        if(formType !== 'update') {return null}
        const onClick = () => {
            const conf = window.confirm('Are you sure you want to delete this item?')
            if(conf) {
                // API call
                // Handle React data
                deleteItem({'itemid': Number(formData.itemid)})

                clearForm();
                console.log('Item Deleted')
            }

        }

        return <button className='btn btn-small' type='button' onClick={onClick}>Delete</button>
    }

    const detailedForm = () => {
        return (
            <div className='pop-up'>
                <form className='standard-form w-[50vw]' onSubmit={onSubmit}>
                    <label htmlFor="itemName">Item Name</label>
                    <input 
                        id='itemName' 
                        name='itemName' 
                        type='text' 
                        value={formData['itemName']}
                        className='w-full'
                        onChange={(e) => {updateForm('itemName', e.target.value)}}
                    required/>
                    <label htmlFor="itemLink">Link</label>
                    <input 
                        id='itemLink' 
                        name='itemLink' 
                        type='text' 
                        value={formData['itemLink']}
                        className='w-full'
                        onChange={(e) => {updateForm('itemLink', e.target.value)}}
                    />
                    <label htmlFor="itemComments">Comments</label>
                    <textarea 
                        id='itemComments' 
                        name='itemComments' 
                        value={formData['itemComments']}
                        className='w-full border border-black rounded-lg px-1'
                        onChange={(e) => {updateForm('itemComments', e.target.value)}}
                    ></textarea>
                    <label htmlFor="itemQtyReq">Number Requested</label>
                    <input 
                        id='itemQtyReq' 
                        name='itemQtyReq' 
                        type='number' 
                        min='0'
                        value={formData['itemQtyReq']}
                        className='w-full'
                        onChange={(e) => {updateForm('itemQtyReq', e.target.value)}}
                    required/>
                    <div className='flex w-full my-5 justify-between'>
                        <button className='btn btn-small' type='button' onClick={clearForm}>Cancel</button>
                        <div className='flex justify-end gap-2'>
                            {deleteButton()}
                            <button className='btn btn-small' type='submit'>Submit</button>
                        </div>
                        
                    </div>
                </form>
            </div>
        )
    }

    const buyForm = () => {
        return (
            <div className='pop-up'>
                <form className='standard-form w-[50vw]' onSubmit={onSubmit}>
                    <span><strong>{formData['itemName']}</strong></span>
                    <span>{`Bought: ${formData['itemQtyPurch']}/${formData['itemQtyReq']}`}</span>
                    <label htmlFor="itemQtyPurch">Update Number Bought</label>
                    <input 
                        id='itemQtyPurch' 
                        name='itemQtyPurch' 
                        type='number' 
                        min='0'
                        value={formData['itemQtyPurch']}
                        className='w-full'
                        onChange={(e) => {updateForm('itemQtyPurch', e.target.value)}}
                    required/>
                    <div className='standard-form-btns'>
                        <button className='btn btn-small' type='button' onClick={clearForm}>Cancel</button>
                        <button className='btn btn-small' type='submit'>Submit</button>
                    </div>
                </form>
            </div>
        )
    }

    return formType === 'buy' ? buyForm() : detailedForm()
    
}

export default ItemForm