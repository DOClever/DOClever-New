import {IRes_Interface_Create, IRes_Interface_Remove, IRes_Interface_Destroy, IRes_Interface_Move, IRes_Interface_Item, IRes_Interface_Share, IRes_Interface_ImportJSON, IRes_Interface_EditSnapshot, IRes_Interface_Merge, IRes_Interface_DocRef} from "./interfaceRes";

const api = {
    create: {
        "method": "POST",
        "path": "/interface/create",
        "param": <{
            name?: string,
            project: string,
            group?: string,
            url?: string,
            remark?: string,
            finish?: number,
            method: string,
            param?: string,
            id?: string,
            autosave?: string
        }>{},
        "data": <IRes_Interface_Create>{},

    },
    remove: {
        "method": "DELETE",
        "path": "/interface/item",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Interface_Remove>[],

    },
    destroy: {
        "method": "DELETE",
        "path": "/interface/destroyitem",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Interface_Destroy>[],

    },
    move: {
        "method": "PUT",
        "path": "/interface/move",
        "param": <{
            id: string,
            group: string,
            index?: number
        }>{},
        "data": <IRes_Interface_Move>[],

    },
    item: {
        "method": "GET",
        "path": "/interface/item",
        "param": <{
            id: string,
            group?: string,
            project?: string,
            run?: number
        }>{},
        "data": <IRes_Interface_Item>{},

    },
    share: {
        "method": "GET",
        "path": "/interface/share",
        "param": <{
            id: string
        }>{},
        "data": <IRes_Interface_Share>{},
    },
    exportJSON: {
        "method": "GET",
        "path": "/interface/exportjson",
        "param": <{
            id: string
        }>{},
        "data": {},

    },
    importJSON: {
        "method": "POST",
        "path": "/interface/importjson",
        "param": <{
            group: string,
            json: string
        }>{},
        "data": <IRes_Interface_ImportJSON>{},

    },
    editSnapshot: {
        "method": "POST",
        "path": "/interface/snapshot",
        "param": <{
            id: string,
            dis: string
        }>{},
        "data": <IRes_Interface_EditSnapshot>{},

    },
    snapshotList: {
        "method": "GET",
        "path": "/interface/snapshotlist",
        "param": <{
            id: string,
            page: number
        }>{},
        "data": <IRes_Interface_EditSnapshot[]>[],

    },
    removeSnapshot: {
        "method": "DELETE",
        "path": "/interface/snapshot",
        "param": <{
            id: string
        }>{},
        "data": {},

    },
    snapshotRoll: {
        "method": "PUT",
        "path": "/interface/snapshotroll",
        "param": <{
            id: string
        }>{},
        "data": {},

    },
    notify: {
        "method": "POST",
        "path": "/interface/notify",
        "param": <{
            id: string,
            users: string,
            content?: string
        }>{},
        "data": {},

    },
    merge: {
        "method": "PUT",
        "path": "/interface/merge",
        "param": <{
            id: string
        }>{},
        "data": <IRes_Interface_Merge>[],

    },
    docRef: {
        "method": "GET",
        "path": "/interface/docref",
        "param": <{
            id: string
        }>{},
        "data": <IRes_Interface_DocRef>[],

    },
    param: {
        "method": "GET",
        "path": "/interface/param",
        "param": <{
            id: string,
            param: string
        }>{},
        "data": <any>{},

    },
}

export = api
