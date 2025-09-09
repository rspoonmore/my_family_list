import { createContext, useState } from 'react';

export const FormContext = createContext();

export const FormProvider = ({ children }) => {
    const blankItemForm = {'membershipid': '', 'itemName': '', 'itemLink': '', 'itemComments': '', 'itemQtyReq': 0, 'itemQtyPuch': 0}
    
    const [formState, setFormState] = useState({
        formType: null,
        formData: blankItemForm
    });

    const updateForm = (key, value) => {
        setFormState(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                [key]: value,
            },
        }));
    };

    const clearForm = () => {
        setFormState({
            formType: null,
            formData: blankItemForm,
        });
    };

    const populateForm = (item) => {
        setFormState(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                ...item
            }
        }))
    }

    const setFormType = (type) => {
        setFormState(prev => ({
            ...prev,
            formType: type
        }))
    }

    const value = {
        formState,
        updateForm,
        clearForm,
        populateForm,
        setFormType
    };

    return (
        <FormContext.Provider value={value}>
            {children}
        </FormContext.Provider>
    );
}