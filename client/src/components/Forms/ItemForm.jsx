import { useContext } from 'react';
import { FormContext } from '../../context/ItemFormContext';

const ItemForm = () => {
    const { formState, updateForm, clearForm, populateForm, setFormType } = useContext(FormContext);
    if(!formState?.formType) {return null}
    if(!formState?.formData) {return null}

    const onSubmit = async (e) => {
        e.preventDefault();
        console.log(formState.formData);

        clearForm();
    }

    return (
        <div className='pop-up'>
            <form className='standard-form' onSubmit={onSubmit}>
                <label htmlFor="itemName">Item Name</label>
                <input 
                    id='itemName' 
                    name='itemName' 
                    type='text' 
                    value={formState.formData['itemName']}
                    onChange={(e) => {updateForm('itemName', e.target.value)}}
                required/>
                <div className='standard-form-btns'>
                    <button className='btn btn-small' type='button' onClick={clearForm}>Cancel</button>
                    <button className='btn btn-small' type='submit'>Submit</button>
                </div>
            </form>
        </div>
    )
}

export default ItemForm