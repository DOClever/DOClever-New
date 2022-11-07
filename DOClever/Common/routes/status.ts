import {IRes_Status_Save} from "./statusRes";

const api = {
    save: {
        "method": "POST",
        "path": "/status/save",
        "param": <{
            id?: string,
            name?: string,
            project?: string,
            data?: string
        }>{},
        "data": <IRes_Status_Save>{},

    },
    remove: {
        "method": "DELETE",
        "path": "/status/remove",
        "param": <{
            id: string,
        }>{},
        "data": {},

    },
    list: {
        "method": "GET",
        "path": "/status/list",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Status_Save[]>[],

    },
    exportJSON: {
        "method": "GET",
        "path": "/status/exportjson",
        "param": <{
            id: string,
        }>{},
        "data": {},

    },
    importJSON: {
        "method": "POST",
        "path": "/status/importjson",
        "param": <{
            project: string,
            json: string
        }>{},
        "data": <IRes_Status_Save>{},

    },
}

export = api
