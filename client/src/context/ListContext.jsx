import { createContext, useState } from 'react';

export const ListContext = createContext(null);

export const ListProvider = ({ children }) => {
    const blankItemForm = {'membershipid': '', 'itemName': '', 'itemLink': '', 'itemComments': '', 'itemQtyReq': 0, 'itemQtyPuch': 0}
    
    const [state, setState] = useState({
        formType: null,
        formData: blankItemForm,
        listDataRaw: [],
        listData: {},
        memberCrosswalk: {}
    });

    const setListDataRaw = (data) => {
        setState(prev => ({
            ...prev,
            listDataRaw: data
        }))
    }

    const processListData = (listRows) => {
        if(listRows.length === 0) return {};
        let newMemberCrosswalk = {};
        let data = {};
        data['listName'] = listRows[0]?.listname || '';
        data['listid'] = listRows[0]?.listid || '';
        data['eventDate'] = listRows[0]?.eventdate || '';
        data['users'] = [];
        listRows.forEach(row => {
            if(!data?.users.some(user => user.userid === Number(row.userid))) { 
                data.users.push({
                    'userid': Number(row.userid), 
                    'userName': `${row.firstname || ''} ${row.lastname || ''}`,
                    'email': row.email || '',
                    'items': []
                })
                newMemberCrosswalk[Number(row.userid)] = Number(row.membershipid)
            }
            if(row.itemid) {
                const user = data?.users.find(user => user.userid === Number(row.userid));
                if (user) {
                    user.items = [...user.items, {
                        'itemid': Number(row.itemid),
                        'itemName': row.itemName || row.itemname || '',
                        'itemLink': row.itemLink || row.itemlink || '',
                        'itemComments': row.itemComments || row.itemcomments || '',
                        'itemQtyReq': Number(row.itemqtyreq || row.itemQtyReq || 0),
                        'itemQtyPurch': Number(row.itemqtypurch || row.itemQtyPurch || 0)
                    }]
                }
            }
        })
        setState(prev => ({
            ...prev,
            listData: data,
            memberCrosswalk: newMemberCrosswalk
        }))
    }

    const updateForm = (key, value) => {
        setState(prevState => ({
            ...prevState,
            formData: {
                ...prevState.formData,
                [key]: value,
            },
        }));
    };

    const clearForm = () => {
        setState(prevState => ({
            ...prevState,
            formType: null,
            formData: blankItemForm,
        }));
    };

    const populateForm = (item) => {
        setState(prevState => ({
            ...prevState,
            formData: {
                ...prevState.formData,
                ...item,
            },
        }));
    }

    const setFormType = (type) => {
        setState(prevState => ({
            ...prevState,
            formType: type,
        }));
    };

    const value = {
        ...state,
        setListDataRaw,
        processListData,
        updateForm,
        clearForm,
        populateForm,
        setFormType
    };

    return (
        <ListContext.Provider value={value}>
            {children}
        </ListContext.Provider>
    );
}