import {
    IRes_Project_ApplyList_Item,
    IRes_Project_Create,
    IRes_Project_EditMember,
    IRes_Project_FilterList_Item,
    IRes_Project_Group_Item,
    IRes_Project_ImportJSON,
    IRes_Project_ImportMemberInfo_Item, IRes_Project_ImportPostMan, IRes_Project_ImportRap, IRes_Project_ImportSwagger,
    IRes_Project_Info,
    IRes_Project_List, IRes_Project_Users_Item
} from "./projectRes";
import {ICommon_Project_BaseUrl} from "./types";
import {IRes_Group_Create} from "./groupRes";

const api = {
    create: {
        "method": "POST",
        "path": "/project/create",
        "param": <{
            name: string,
            dis?: string,
            id?: string,
            import?: number,
            team?: string,
            public?: number
        }>{},
        "data": <IRes_Project_Create>{},

    },
    editMemeber: {
        "method": "POST",
        "path": "/project/member",
        "param": <{
            id: string,
            user: string,
            role: number,
            option?: string
        }>{},
        "data": <IRes_Project_EditMember>{},

    },
    editRole: {
        "method": "PUT",
        "path": "/project/role",
        "param": <{
            id: string,
            user: string,
            role: number,
            option?: string
        }>{},
        "data": {},

    },
    removeMember: {
        "method": "DELETE",
        "path": "/project/member",
        "param": <{
            id: string,
            user: string,
        }>{},
        "data": {},

    },
    list: {
        "method": "GET",
        "path": "/project/list",
        "param": <{}>{},
        "data": <IRes_Project_List>{},

    },
    filterList: {
        "method": "GET",
        "path": "/project/filterlist",
        "param": <{
            team?: string,
            name?: string
        }>{},
        "data": <IRes_Project_FilterList_Item[]>[],

    },
    editUrl: {
        "method": "PUT",
        "path": "/project/url",
        "param": <{
            id: string,
            urls?: string
        }>{},
        "data": <ICommon_Project_BaseUrl[]>[],

    },
    info: {
        "method": "GET",
        "path": "/project/info",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Project_Info>{},

    },
    group: {
        "method": "GET",
        "path": "/project/group",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Project_Group_Item[]>[],

    },
    interface: {
        "method": "GET",
        "path": "/project/interface",
        "param": <{
            id: string,
            group?: string,
            sort?:number
        }>{},
        "data": <IRes_Group_Create[]>[],

    },
    clear: {
        "method": "DELETE",
        "path": "/project/clear",
        "param": <{
            id: string,
        }>{},
        "data":<IRes_Group_Create[]>[],

    },
    remove: {
        "method": "DELETE",
        "path": "/project/item",
        "param": <{
            id: string,
        }>{},
        "data": {},

    },
    quit: {
        "method": "DELETE",
        "path": "/project/quit",
        "param": <{
            id: string,
        }>{},
        "data": {},

    },
    addUrl: {
        "method": "PUT",
        "path": "/project/addurl",
        "param": <{
            id: string,
            url: string
        }>{},
        "data": {},

    },
    exportJSON: {
        "method": "GET",
        "path": "/project/exportjson",
        "param": <{
            id: string,
            version?: string
        }>{},
        "data": {},

    },
    exportHTML: {
        "method": "GET",
        "path": "/project/exporthtml",
        "param": <{
            id: string,
            version?: string
        }>{},
        "data": {},

    },
    importJSON: {
        "method": "POST",
        "path": "/project/importjson",
        "param": <{
            json: string,
            team?: string
        }>{},
        "data": <IRes_Project_ImportJSON>{},

    },
    inject: {
        "method": "PUT",
        "path": "/project/inject",
        "param": <{
            id: string,
            before?: string,
            after?: string
        }>{},
        "data": {},

    },
    urlList: {
        "method": "GET",
        "path": "/project/urllist",
        "param": <{
            id: string
        }>{},
        "data": <ICommon_Project_BaseUrl[]>[],

    },
    importMemberInfo: {
        "method": "GET",
        "path": "/project/importmember",
        "param": <{
            id: string
        }>{},
        "data": <IRes_Project_ImportMemberInfo_Item[]>[],

    },
    editImportMemeber: {
        "method": "POST",
        "path": "/project/importmember",
        "param": <{
            id: string,
            data: string
        }>{},
        "data": {},

    },
    editOwner: {
        "method": "PUT",
        "path": "/project/owner",
        "param": <{
            id: string,
            user: string
        }>{},
        "data": {},

    },
    applyList: {
        "method": "GET",
        "path": "/project/applylist",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Project_ApplyList_Item[]>[],

    },
    handleApply: {
        "method": "PUT",
        "path": "/project/handleapply",
        "param": <{
            id: string,
            apply: string,
            state: number
        }>{},
        "data": {},

    },
    editUser: {
        "method": "PUT",
        "path": "/project/user",
        "param": <{
            id: string,
            user: string
        }>{},
        "data": {},

    },
    users: {
        "method": "GET",
        "path": "/project/users",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Project_Users_Item[]>[],

    },
    importRap: {
        "method": "POST",
        "path": "/project/importrap",
        "param": <{
            json: string,
            team?: string,
            bodytype: number
        }>{},
        "data":<IRes_Project_ImportRap> {},

    },
    importSwagger: {
        "method": "POST",
        "path": "/project/importswagger",
        "param": <{
            json?: string,
            team?: string,
            url?: string
        }>{},
        "data": <IRes_Project_ImportSwagger>{},

    },
    updateSwagger: {
        "method": "PUT",
        "path": "/project/updateswagger",
        "param": <{
            id: string,
            json?: string,
            url?: string
        }>{},
        "data": {},

    },
    importPostman: {
        "method": "POST",
        "path": "/project/importpostman",
        "param": <{
            json: string,
            team?: string,
            baseurl: string,
            ignore: number
        }>{},
        "data": <IRes_Project_ImportPostMan>{},

    },
    exportDoc: {
        "method": "GET",
        "path": "/project/exportdocx",
        "param": <{
            id: string,
            version?: string
        }>{},
        "data": {},

    }
}

export = api
