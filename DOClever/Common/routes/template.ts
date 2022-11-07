import {IRes_Template_Edit, IRes_Template_List_Item} from "./templateRes";

const api = {
    edit: {
        "method": "POST",
        "path": "/template/item",
        "param": <{
            project: string,
            id?: string,
            name: string,
            url?: string,
            remark?: string,
            method: string,
            param: string,
            version?: string,
        }>{},
        "data": <IRes_Template_Edit>{},

    },
    item: {
        "method": "GET",
        "path": "/template/item",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Template_Edit>{},

    },
    list: {
        "method": "GET",
        "path": "/template/list",
        "param": <{
            project: string,
        }>{},
        "data": <IRes_Template_List_Item[]>[],

    },
    remove: {
        "method": "DELETE",
        "path": "/template/item",
        "param": <{
            id: string,
        }>{},
        "data": {},

    }
}


export = api