import { useContext } from 'react';
import { ListContext } from '../../context/ListContext';

const ItemForm = () => {
    const { formType, formData, updateForm, clearForm, populateForm, setFormType } = useContext(ListContext);
    if(!formType) {return null}
    if(!formData) {return null}

    const onSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);

        clearForm();
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
                    <div className='standard-form-btns'>
                        <button className='btn btn-small' type='button' onClick={clearForm}>Cancel</button>
                        <button className='btn btn-small' type='submit'>Submit</button>
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
                    <label htmlFor="itemQtyPurch">Number Bought</label>
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