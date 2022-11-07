import {IRes_Article_Save, IRes_Article_Info, IRes_Article_List_Info} from "./articleRes";

const api = {
    save: {
        "method": "POST",
        "path": "/article/save",
        "param": <{
            project: string,
            id?: string,
            title: string,
            content?: string
        }>{},
        "data": <IRes_Article_Save>{},
    },
    remove: {
        "method": "DELETE",
        "path": "/article/item",
        "param": <{
            id: string,
        }>{},
        "data": {},
    },
    info: {
        "method": "GET",
        "path": "/article/item",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Article_Info>{},
    },
    list: {
        "method": "GET",
        "path": "/article/list",
        "param": <{
            project: string,
            page: number
        }>{},
        "data": <IRes_Article_List_Info[]>[],
    },
}
export = api
