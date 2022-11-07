import {IRes_Poll_Info, IRes_Poll_Save} from "./pollRes";

const api = {
    save: {
        "method": "POST",
        "path": "/poll/save",
        "param": <{
            id?: string,
            project: string,
            users: string,
            date: string,
            time: string,
            user: string,
            password: string,
            smtp: string,
            port: number,
            url: string,
            immediate: number,
            phoneinfo: string,
            failsend: number,
            collection: string,
            interproject?: string,
            owner: string
        }>{},
        "data": <IRes_Poll_Save>{},

    },
    remove: {
        "method": "DELETE",
        "path": "/poll/item",
        "param": <{
            id: string
        }>{},
        "data": {},

    },
    item: {
        "method": "GET",
        "path": "/poll/item",
        "param": <{
            id: string
        }>{},
        "data": <IRes_Poll_Info>{},

    },
}

export = api