import {IRes_Group_Create, IRes_Group_ImportJSON, IRes_Group_Merge, IRes_Group_Move} from "./groupRes";

const api = {
    create: {
        "method": "POST",
        "path": "/group/create",
        "param": <{
            name?: string,
            id?: string,
            group?: string,
            import?: number,
            parent?: string
        }>{},
        "data": <IRes_Group_Create>{},

    },
    remove: {
        "method": "DELETE",
        "path": "/group/item",
        "param": <{
            group: string
        }>{},
        "data": {},

    },
    exportJSON: {
        "method": "GET",
        "path": "/group/exportjson",
        "param": <{
            group: string
        }>{},
        "data": {},

    },
    importJSON: {
        "method": "POST",
        "path": "/group/importjson",
        "param": <{
            id: string,
            json: string,
            group?: string
        }>{},
        "data": <IRes_Group_ImportJSON>{},

    },
    move: {
        "method": "PUT",
        "path": "/group/move",
        "param": <{
            group: string,
            to?: string,
            index?: number
        }>{},
        "data": <IRes_Group_Move>{},

    },
    merge: {
        "method": "PUT",
        "path": "/group/merge",
        "param": <{
            group: string,
        }>{},
        "data":<IRes_Group_Merge> {},

    },
}

export = api
