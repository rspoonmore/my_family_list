import { useContext } from 'react';
import { ListContext } from '../../context/ListContext';

const ItemForm = () => {
    const { formType, formData, updateForm, clearForm, addItem, updateItem, deleteItem } = useContext(ListContext);
    const apiUrl = import.meta.env.VITE_API_URL;
    if(!formType) {return null}
    if(!formData) {return null}

    const onSubmit = async (e) => {
        e.preventDefault();
        console.log('formType: ', formType, '\nformData: ', formData);
        let method = '';
        let reactCleanerFunction = null;
        let fetchUrl = `${apiUrl}/items`;
        if(formType === 'new') {
            method = 'POST';
            reactCleanerFunction = addItem;
        } else if(formType === 'update' || formType === 'buy') {
            method = 'PUT';
            fetchUrl = fetchUrl + `/${String(formData?.itemid)}`
            reactCleanerFunction = updateItem;
        } else {
            return window.alert('There was an issue with the form submission. The formType was not valid.')
        }

        // API Request
        try {
            const response = await fetch(fetchUrl, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            const res = await response.json();
            if(!res?.success){
                console.log(JSON.stringify(res))
                return window.alert('API res not successful')
            }
            if(formType === 'new') {
                if(!res?.item) {
                    return window.alert('API res does not contain new item')
                }
                const newItem = {item: {...res.item, 'userid': Number(formData.userid)}};
                reactCleanerFunction(newItem);
            } else {
                reactCleanerFunction({item: formData})
            }
            clearForm();
            return
        } catch (error) {
            console.log(error)
            window.alert('Error with api request');
        }
    }

    const deleteButton = () => {
        if(formType !== 'update') {return null}
        if(!formData?.itemid) {return null}
        const onClick = async () => {
            const conf = window.confirm('Are you sure you want to delete this item?')
            if(conf) {
                // API call
                try {
                    const response = await fetch(`${apiUrl}/items/${formData.itemid}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include'
                    });
                    const res = await response.json();
                    if(!res?.success){
                        console.log(JSON.stringify(res))
                        return window.alert('API res not successful')
                    }
                    // Handle React data
                    deleteItem({'itemid': Number(formData.itemid)});
                    clearForm();
                } catch (error) {
                    console.log(error)
                    window.alert('Error with api request');
                }
            }

        }

        return <button className='btn' type='button' onClick={onClick}>Delete</button>
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
                        <button className='btn' type='button' onClick={clearForm}>Cancel</button>
                        <div className='flex justify-end gap-2'>
                            {deleteButton()}
                            <button className='btn' type='submit'>Submit</button>
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
                    <div className='flex w-full my-5 justify-between'>
                        <button className='btn' type='button' onClick={clearForm}>Cancel</button>
                        <button className='btn' type='submit'>Submit</button>
                    </div>
                </form>
            </div>
        )
    }

    return formType === 'buy' ? buyForm() : detailedForm()
    
}

export default ItemForm