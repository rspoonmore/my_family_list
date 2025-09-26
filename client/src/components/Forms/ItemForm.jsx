import { useContext } from 'react';
import { ListContext } from '../../context/ListContext';
import Icon from '@mdi/react'
import { mdiDelete } from '@mdi/js'

const ItemForm = () => {
    const { formType, formData, updateForm, clearForm, addItem, updateItem, deleteItem } = useContext(ListContext);
    const apiUrl = import.meta.env.VITE_API_URL;
    if(!formType) {return null}
    if(!formData) {return null}

    const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
    const primaryButtonClass = 'px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-700 hover:bg-green-900 transition-colors shadow-md';
    const secondaryButtonClass = 'px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors';
    const dangerButtonClass = 'px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md';

    const onSubmit = async (e) => {
        e.preventDefault();
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
                return window.alert('API response not successful. Check console for details.')
            }
            reactCleanerFunction(res.item);
            clearForm(); // Close the form on success

        } catch(error) {
            console.log(error);
            window.alert('There was an issue with the API request. Check console for details.');
        }
    }

    const deleteButton = () => {
        if(formType !== 'update') {return null}

        const onClick = async () => {
            if(!window.confirm(`Are you sure you want to delete ${formData['itemName']}?`)) {return null}
            try {
                const response = await fetch(`${apiUrl}/items/${String(formData?.itemid)}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                const res = await response.json();
                if(!res?.success) {
                    console.log(JSON.stringify(res))
                    return window.alert('API response not successful. Check console for details.')
                }
                deleteItem(formData);
                clearForm(); // Close the form on success
            } catch(error) {
                console.log(error);
                window.alert('There was an issue with the API request. Check console for details.');
            }
        }
        
        return (
            <button className={dangerButtonClass + ' flex items-center gap-1'} type='button' onClick={onClick}>
                <Icon path={mdiDelete} size={0.7} /> Delete
            </button>
        )
    }

    const detailedForm = () => {
        const title = (formType === 'new') ? 'Add New Item' : `Update Item: ${formData['itemName'] || ''}`;

        return (
            <div className='fixed inset-0 bg-gray-600 bg-opacity-75 flex items-start justify-center pt-24 z-50'> 
                
                {/* FORM CARD: Styled as a centered card */}
                <form className='bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg space-y-4' onSubmit={onSubmit}>
                    <h3 className='text-xl font-bold text-gray-800 border-b pb-3 mb-4'>{title}</h3>
                    
                    {/* Item Name */}
                    <div>
                        <label htmlFor='itemName' className='block text-sm font-medium text-gray-700'>Item Name</label>
                        <input 
                            id='itemName' 
                            name='itemName' 
                            type='text' 
                            value={formData['itemName']}
                            onChange={(e) => {updateForm('itemName', e.target.value)}}
                            className={inputClass}
                        required/>
                    </div>
                    
                    {/* Item Link */}
                    <div>
                        <label htmlFor='itemLink' className='block text-sm font-medium text-gray-700'>Link (Optional)</label>
                        <input 
                            id='itemLink' 
                            name='itemLink' 
                            type='text' 
                            value={formData['itemLink']}
                            onChange={(e) => {updateForm('itemLink', e.target.value)}}
                            className={inputClass}
                        />
                    </div>

                    {/* Quantity Required and Comments */}
                    <div className='flex gap-4'>
                        <div className='flex-none w-1/3'>
                            <label htmlFor='itemQtyReq' className='block text-sm font-medium text-gray-700'>Quantity Requested</label>
                            <input 
                                id='itemQtyReq' 
                                name='itemQtyReq' 
                                type='number' 
                                min='1'
                                value={formData['itemQtyReq']}
                                onChange={(e) => {updateForm('itemQtyReq', e.target.value)}}
                                className={inputClass}
                            required/>
                        </div>
                        <div className='flex-1'>
                            <label htmlFor='itemComments' className='block text-sm font-medium text-gray-700'>Comments (Optional)</label>
                            <textarea 
                                id='itemComments' 
                                name='itemComments' 
                                value={formData['itemComments']}
                                onChange={(e) => {updateForm('itemComments', e.target.value)}}
                                rows="2"
                                className={inputClass}
                            />
                        </div>
                    </div>
                    
                    {/* Button Group */}
                    <div className='flex w-full justify-between pt-4 border-t'>
                        <button className={secondaryButtonClass} type='button' onClick={clearForm}>Cancel</button>
                        <div className='flex gap-3'>
                            {deleteButton()}
                            <button className={primaryButtonClass} type='submit'>
                                {formType === 'new' ? 'Add Item' : 'Update Item'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }

    const buyForm = () => {
        return (
            <div className='fixed inset-0 bg-gray-600 bg-opacity-75 flex items-start justify-center pt-24 z-50'>
                <form className='bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm space-y-4' onSubmit={onSubmit}>
                    <h3 className='text-xl font-bold text-gray-800 border-b pb-3 mb-4'>Purchasing Item</h3>

                    <span className='block text-lg font-medium'>{formData['itemName']}</span>
                    <span className='block text-sm text-gray-600'>Requested: {formData['itemQtyReq']}</span>
                    
                    <label htmlFor="itemQtyPurch" className='block text-sm font-medium text-gray-700 pt-2'>Update Number Purchased:</label>
                    <input 
                        id='itemQtyPurch' 
                        name='itemQtyPurch' 
                        type='number' 
                        min='0'
                        max={formData['itemQtyReq']} // Added max constraint
                        value={formData['itemQtyPurch']}
                        className={inputClass}
                        onChange={(e) => {updateForm('itemQtyPurch', e.target.value)}}
                    required/>
                    
                    <div className='flex w-full justify-between pt-4 border-t'>
                        <button className={secondaryButtonClass} type='button' onClick={clearForm}>Cancel</button>
                        <button className={primaryButtonClass} type='submit'>Update Purchase</button>
                    </div>
                </form>
            </div>
        )
    }

    return formType === 'buy' ? buyForm() : detailedForm()
    
}

export default ItemForm