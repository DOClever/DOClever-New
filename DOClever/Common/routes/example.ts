import {IRes_Example_EditItem, IRes_Example_Item, IRes_Example_AllList} from "./exampleRes";

const api = {
    editItem: {
        "method": "POST",
        "path": "/example/item",
        "param": <{
            project: string,
            id?: string,
            interface: string,
            paramid: string,
            name: string,
            param: string
        }>{},
        "data": <IRes_Example_EditItem>{},

    },
    item: {
        "method": "GET",
        "path": "/example/item",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Example_Item>{},

    },
    list: {
        "method": "GET",
        "path": "/example/list",
        "param": <{
            interface: string,
            paramid: string
        }>{},
        "data": <IRes_Example_Item[]>[],

    },
    removeItem: {
        "method": "DELETE",
        "path": "/example/item",
        "param": <{
            id: string,
        }>{},
        "data": {},

    },
    allList: {
        "method": "GET",
        "path": "/example/alllist",
        "param": <{
            interface: string,
        }>{},
        "data": <IRes_Example_AllList>{},

    },
}

export = api
