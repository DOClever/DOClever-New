import {
    IRes_Team_ApplyInfo_Item, IRes_Team_DocList_Item, IRes_Team_DocUser_Item,
    IRes_Team_Info, IRes_Team_Info_TeamGroup, IRes_Team_List, IRes_Team_MoveUser, IRes_Team_ProjectList_Item,
    IRes_Team_projectUser_Item,
    IRes_Team_RemoveProjectUser_Project,
    IRes_Team_Save, IRes_Team_TestList_Item, IRes_Team_TestUser_Item, IRes_Team_UserPulledList_Item
} from "./teamRes";
import {ICommon_Team_Notice_Item} from "./types";

const api = {
    save: {
        "method": "POST",
        "path": "/team/save",
        "param": <{
            id?: string,
            name?: string,
            dis?: string,
        }>{},
        "data": <IRes_Team_Save>{},

    },
    info: {
        "method": "GET",
        "path": "/team/info",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Team_Info>{},

    },
    pullUser: {
        "method": "PUT",
        "path": "/team/pulluser",
        "param": <{
            id: string,
            user: string,
            group: string,
        }>{},
        "data": {},

    },
    removeUser: {
        "method": "DELETE",
        "path": "/team/user",
        "param": <{
            id: string,
            user: string,
            self?: number
        }>{},
        "data": {},

    },
    removeProjectUser: {
        "method": "DELETE",
        "path": "/team/projectuser",
        "param": <{
            id: string,
            user: string
        }>{},
        "data": <IRes_Team_RemoveProjectUser_Project[]>[],

    },
    projectUser: {
        "method": "GET",
        "path": "/team/projectuser",
        "param": <{
            id: string,
            project: string
        }>{},
        "data":<IRes_Team_projectUser_Item[]>[],

    },
    editUserRole: {
        "method": "PUT",
        "path": "/team/userrole",
        "param": <{
            id: string,
            user: string
        }>{},
        "data": {},

    },
    moveUser: {
        "method": "PUT",
        "path": "/team/moveuser",
        "param": <{
            id: string,
            user: string,
            group: string
        }>{},
        "data": <IRes_Team_MoveUser>{},

    },
    editGroup: {
        "method": "POST",
        "path": "/team/group",
        "param": <{
            id?: string,
            group?: string,
            name?: string,
        }>{},
        "data": <IRes_Team_Info_TeamGroup>{},

    },
    removeGroup: {
        "method": "DELETE",
        "path": "/team/group",
        "param": <{
            id: string,
            group: string,
        }>{},
        "data": {},

    },
    pullProject: {
        "method": "PUT",
        "path": "/team/pullproject",
        "param": <{
            id: string,
            project: string
        }>{},
        "data": {},

    },
    userApply: {
        "method": "PUT",
        "path": "/team/userapply",
        "param": <{
            id: string,
            dis?: string
        }>{},
        "data": {},

    },
    projectApply: {
        "method": "PUT",
        "path": "/team/projectapply",
        "param": <{
            id: string,
            project?: string,
            dis?: string
        }>{},
        "data": {},

    },
    group: {
        "method": "GET",
        "path": "/team/group",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Team_Info_TeamGroup[]>[],

    },
    editNotice: {
        "method": "POST",
        "path": "/team/notice",
        "param": <{
            id: string,
            notice?: string,
            content: string
        }>{},
        "data": <ICommon_Team_Notice_Item>{},

    },
    notice: {
        "method": "GET",
        "path": "/team/notice",
        "param": <{
            id: string,
            page: number
        }>{},
        "data": <ICommon_Team_Notice_Item[]>[],

    },
    removeNotice: {
        "method": "DELETE",
        "path": "/team/notice",
        "param": <{
            id: string,
            notice: string
        }>{},
        "data": {},

    },
    applyInfo: {
        "method": "GET",
        "path": "/team/apply",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Team_ApplyInfo_Item[]>[],

    },
    editApply: {
        "method": "PUT",
        "path": "/team/apply",
        "param": <{
            id: string,
            apply: string,
            state: number,
            group?: string,
            role?: number
        }>{},
        "data": {},

    },
    removeProject: {
        "method": "DELETE",
        "path": "/team/project",
        "param": <{
            id: string,
            project: string
        }>{},
        "data": {},

    },
    userPulledList: {
        "method": "GET",
        "path": "/team/userpulledlist",
        "param": <{
            id: string,
            project: string
        }>{},
        "data": <IRes_Team_UserPulledList_Item[]>[],

    },
    userJoin: {
        "method": "PUT",
        "path": "/team/userJoin",
        "param": <{
            id: string,
            user: string,
            group: string,
            role: number
        }>{},
        "data": {},

    },
    remove: {
        "method": "DELETE",
        "path": "/team/item",
        "param": <{
            id: string,
        }>{},
        "data": {},

    },
    transfer: {
        "method": "PUT",
        "path": "/team/transfer",
        "param": <{
            id: string,
            user: string
        }>{},
        "data": {},

    },
    user: {
        "method": "GET",
        "path": "/team/user",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Team_Info_TeamGroup[]>[],

    },
    list: {
        "method": "GET",
        "path": "/team/list",
        "param": <{}>{},
        "data": <IRes_Team_List>{},

    },
    projectList: {
        "method": "GET",
        "path": "/team/projectlist",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Team_ProjectList_Item[]>[],

    },
    docList: {
        "method": "GET",
        "path": "/team/doclist",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Team_DocList_Item[]>[],

    },
    testList: {
        "method": "GET",
        "path": "/team/testlist",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Team_TestList_Item[]>[],

    },
    removeDoc: {
        "method": "DELETE",
        "path": "/team/doc",
        "param": <{
            id: string,
            project: string
        }>{},
        "data": {},

    },
    docUser: {
        "method": "GET",
        "path": "/team/docuser",
        "param": <{
            id: string,
            project: string
        }>{},
        "data": <IRes_Team_DocUser_Item[]>[],

    },
    pullDoc: {
        "method": "PUT",
        "path": "/team/pulldoc",
        "param": <{
            id: string,
            project: string
        }>{},
        "data": {},

    },
    docApply: {
        "method": "PUT",
        "path": "/team/docapply",
        "param": <{
            id: string,
            project?: string,
            dis?: string
        }>{},
        "data": {},

    },
    removeTest: {
        "method": "DELETE",
        "path": "/team/test",
        "param": <{
            id: string,
            project: string
        }>{},
        "data": {},

    },
    testUser: {
        "method": "GET",
        "path": "/team/testuser",
        "param": <{
            id: string,
            project: string
        }>{},
        "data": <IRes_Team_TestUser_Item[]>[],

    },
    pullTest: {
        "method": "PUT",
        "path": "/team/pulltest",
        "param": <{
            id: string,
            project: string
        }>{},
        "data": {},

    },
    testApply: {
        "method": "PUT",
        "path": "/team/testapply",
        "param": <{
            id: string,
            project?: string,
            dis?: string
        }>{},
        "data": {},

    },
}

export = api
