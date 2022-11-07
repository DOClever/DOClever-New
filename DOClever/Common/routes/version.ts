import {IRes_Version_Save} from "./versionRes";

const api = {
    save: {
        "method": "POST",
        "path": "/version/save",
        "param": <{
            id?: string,
            project: string,
            version: string,
            dis?: string
        }>{},
        "data":<IRes_Version_Save> {},

    },
    list: {
        "method": "GET",
        "path": "/version/list",
        "param": <{
            project: string,
            page: number
        }>{},
        "data": <IRes_Version_Save[]>[],

    },
    remove: {
        "method": "DELETE",
        "path": "/version/item",
        "param": <{
            id: string,
        }>{},
        "data": {},

    },
    roll: {
        "method": "PUT",
        "path": "/version/roll",
        "param": <{
            id: string,
        }>{},
        "data": {},

    },
}

export = api