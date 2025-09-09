const ItemForm = ({formType=null, formData={}, updateForm=null, clearForm=null}) => {
    if(!formType) {return null}
    if(!formData) {return null}
    if(!updateForm) {return null}
    if(!clearForm) {return null}

    const onSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);

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
                    value={formData['itemName']}
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