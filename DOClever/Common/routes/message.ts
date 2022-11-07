import {IRes_Message_ApplyList, IRes_Message_List} from "./messageRes";

const api = {
    remove: {
        "method": "DELETE",
        "path": "/message/item",
        "param": <{
            id: string,
        }>{},
        "data": {},

    },
    list: {
        "method": "GET",
        "path": "/message/list",
        "param": <{
            page: number
        }>{},
        "data":<IRes_Message_List>[],

    },
    clear: {
        "method": "DELETE",
        "path": "/message/clear",
        "param": <{}>{},
        "data": {},

    },
    new: {
        "method": "GET",
        "path": "/message/new",
        "param": <{}>{},
        "data": <boolean>{},

    },
    applyList: {
        "method": "GET",
        "path": "/message/applylist",
        "param": <{}>{},
        "data": <IRes_Message_ApplyList>{},

    },
}

export = api