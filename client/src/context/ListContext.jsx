import { createContext, useState } from 'react';

export const ListContext = createContext(null);

export const ListProvider = ({ children }) => {
    const blankItemForm = {'membershipid': '', 'itemName': '', 'itemLink': '', 'itemComments': '', 'itemQtyReq': 0, 'itemQtyPurch': 0}
    
    const [state, setState] = useState({
        formType: null,
        formData: blankItemForm,
        listDataRaw: [],
        listData: {},
        memberCrosswalk: {}
    });

    const loadStateData = (listRows) => {
        const processedData = processListData(listRows || []);

        setState(prev => ({
            ...prev,
            listDataRaw: listRows || [],
            listData: processedData?.data || {},
            memberCrosswalk: processedData?.memberCrosswalk || {}
        }))
    }

    const addItem = ({item=null}) => {
        if(!item || !item?.userid || !item?.itemid) {return null}
        const supplementedItem = {
            ...item,
            listname: state.listData?.listName || '',
            listid: state.listData?.listid || '',
            eventdata: state.listData?.eventDate || ''
        }
        const updatedListDataRaw = [...state.listDataRaw, supplementedItem]
        loadStateData(updatedListDataRaw)
    }

    const updateItem = ({item=null}) => {
        if(!item || !item?.userid || !item?.itemid) {return null}
        const editedListRows = [...state.listDataRaw].map(listRow => {
            if (Number(listRow.itemid) === Number(item.itemid)) {
                const editedRow = {...listRow};
                editedRow['itemname'] = item.itemName || item.itemname || listRow['itemname'];
                editedRow['itemlink'] = item.itemLink || item.itemlink || listRow['itemlink'];
                editedRow['itemcomments'] = item.itemComments || item.itemcomments || listRow['itemcomments'];
                editedRow['itemqtyreq'] = Number(item.itemqtyreq || item.itemQtyReq || listRow['itemqtyreq']);
                editedRow['itemqtypurch'] = Number(item.itemqtypurch || item.itemQtyPurch || listRow['itemqtypurch']);
                return editedRow;
            }
            return listRow;
        })

        loadStateData(editedListRows)

    }

    const deleteItem = ({itemid=null}) => {
        if(!itemid) {return null}
        loadStateData([...state.listDataRaw].filter(row => Number(row.itemid) !== Number(itemid)))
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
        return { 'data': data, 'memberCrosswalk': newMemberCrosswalk };
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
        loadStateData,
        addItem,
        updateItem,
        deleteItem,
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