import {
    IRes_Test_AllGroupList_Item,
    IRes_Test_AllList_Item,
    IRes_Test_Collection,
    IRes_Test_CollectionList_Item,
    IRes_Test_EditCollection,
    IRes_Test_EditProject,
    IRes_Test_EditTest,
    IRes_Test_FilterList_Item,
    IRes_Test_ImportGroup,
    IRes_Test_ImportModule,
    IRes_Test_ImportProject, IRes_Test_ImportTest,
    IRes_Test_Info,
    IRes_Test_Interface,
    IRes_Test_InterfaceList_Team,
    IRes_Test_InterfaceProject,
    IRes_Test_List_Group,
    IRes_Test_List_Module, IRes_Test_PasteTest,
    IRes_Test_ProjectList,
    IRes_Test_Test,
    IRes_Test_UrlList_Item
} from "./testRes";
import {ICommon_User} from "./types";

const api = {
    editTest: {
        "method": "POST",
        "path": "/test/test",
        "param": <{
            id?: string,
            name?: string,
            group?: string,
            remark?: string,
            status?: number,
            code?: string,
            ui?: string,
            output?: string,
            user?: string
        }>{},
        "data": <IRes_Test_EditTest>{},

    },
    list: {
        "method": "GET",
        "path": "/test/list",
        "param": <{
            project: string,
            user?: string
        }>{},
        "data": <IRes_Test_List_Module[]>[],

    },
    info: {
        "method": "GET",
        "path": "/test/info",
        "param": <{
            project: string,
            only?: number,
            user?: string
        }>{},
        "data": <IRes_Test_Info>{},

    },
    editModule: {
        "method": "POST",
        "path": "/test/module",
        "param": <{
            project?: string,
            name: string,
            module?: string,
            user?: string
        }>{},
        "data":<IRes_Test_List_Module> {},

    },
    editGroup: {
        "method": "POST",
        "path": "/test/group",
        "param": <{
            module?: string,
            name: string,
            group?: string,
            project?: string,
            user?: string
        }>{},
        "data":<IRes_Test_List_Group> {},

    },
    removeModule: {
        "method": "DELETE",
        "path": "/test/module",
        "param": <{
            module: string,
        }>{},
        "data": {},

    },
    removeGroup: {
        "method": "DELETE",
        "path": "/test/group",
        "param": <{
            group: string,
        }>{},
        "data": {},

    },
    removeTest: {
        "method": "DELETE",
        "path": "/test/test",
        "param": <{
            id: string,
        }>{},
        "data": {},

    },
    test: {
        "method": "GET",
        "path": "/test/test",
        "param": <{
            id: string,
            project?: string,
            type?: string
        }>{},
        "data": <IRes_Test_Test>{},

    },
    editStatus: {
        "method": "PUT",
        "path": "/test/status",
        "param": <{
            id: string,
            status: number,
            output?: string
        }>{},
        "data": {},

    },
    editOutput: {
        "method": "PUT",
        "path": "/test/output",
        "param": <{
            id: string,
            output?: string
        }>{},
        "data": {},

    },
    move: {
        "method": "PUT",
        "path": "/test/move",
        "param": <{
            id: string,
            group: string
        }>{},
        "data": {},

    },
    projectList: {
        "method": "GET",
        "path": "/test/projectlist",
        "param": <{}>{},
        "data": <IRes_Test_ProjectList>{},

    },
    editProject: {
        "method": "POST",
        "path": "/test/project",
        "param": <{
            project?: string,
            name: string,
            dis?: string,
            team?: string,
        }>{},
        "data": <IRes_Test_EditProject>{},

    },
    removeProject: {
        "method": "DELETE",
        "path": "/test/project",
        "param": <{
            project: string
        }>{},
        "data": {},

    },
    handleApply: {
        "method": "PUT",
        "path": "/test/handleapply",
        "param": <{
            project: string,
            apply: string,
            state: number
        }>{},
        "data": {},

    },
    editOwner: {
        "method": "PUT",
        "path": "/test/owner",
        "param": <{
            project: string,
            user: string
        }>{},
        "data": {},

    },
    filterList: {
        "method": "GET",
        "path": "/test/filterlist",
        "param": <{
            team?: string,
            name?: string
        }>{},
        "data": <IRes_Test_FilterList_Item[]>[],

    },
    editUser: {
        "method": "POST",
        "path": "/test/user",
        "param": <{
            project: string,
            user: string
        }>{},
        "data": <ICommon_User>{},

    },
    removeUser: {
        "method": "DELETE",
        "path": "/test/user",
        "param": <{
            project: string,
            user: string
        }>{},
        "data": {},

    },
    edtUser: {
        "method": "PUT",
        "path": "/test/user",
        "param": <{
            project: string,
            user: string
        }>{},
        "data": {},

    },
    users: {
        "method": "GET",
        "path": "/test/users",
        "param": <{
            project: string,
        }>{},
        "data": {},

    },
    quit: {
        "method": "DELETE",
        "path": "/test/quit",
        "param": <{
            project: string,
        }>{},
        "data": {},

    },
    interfaceList: {
        "method": "GET",
        "path": "/test/interfacelist",
        "param": <{}>{},
        "data": <IRes_Test_InterfaceList_Team[]>[],

    },
    interface: {
        "method": "GET",
        "path": "/test/interface",
        "param": <{
            interface: string,
            only?: number
        }>{},
        "data": <IRes_Test_Interface>{},

    },
    urlList: {
        "method": "GET",
        "path": "/test/urllist",
        "param": <{
            project: string,
            user: string,
            urls?: string
        }>{},
        "data": <IRes_Test_UrlList_Item[]>[],

    },
    interfaceProject: {
        "method": "GET",
        "path": "/test/interfaceproject",
        "param": <{
            project: string,
            version?: string
        }>{},
        "data": <IRes_Test_InterfaceProject>{},

    },
    editCollection: {
        "method": "POST",
        "path": "/test/collection",
        "param": <{
            collection?: string,
            project?: string,
            name: string,
            output?: string,
            test?: string,
            user?: string
        }>{},
        "data": <IRes_Test_EditCollection>{},

    },
    collectionList: {
        "method": "GET",
        "path": "/test/collectionlist",
        "param": <{
            project: string,
            user?: string
        }>{},
        "data": <IRes_Test_CollectionList_Item[]>[],

    },
    collection: {
        "method": "GET",
        "path": "/test/collection",
        "param": <{
            collection: string
        }>{},
        "data": <IRes_Test_Collection>{},

    },
    removeCollection: {
        "method": "DELETE",
        "path": "/test/collection",
        "param": <{
            collection: string
        }>{},
        "data": {},

    },
    cooperation: {
        "method": "GET",
        "path": "/test/cooperation",
        "param": <{
            project: string,
        }>{},
        "data": <string[]>[],

    },
    editCooperation: {
        "method": "POST",
        "path": "/test/cooperation",
        "param": <{
            project: string,
            users: string
        }>{},
        "data": {},

    },
    allGroupList: {
        "method": "GET",
        "path": "/test/allgrouplist",
        "param": <{}>{},
        "data": <IRes_Test_AllGroupList_Item[]>[],

    },
    allList: {
        "method": "GET",
        "path": "/test/alllist",
        "param": <{}>{},
        "data": <IRes_Test_AllList_Item[]>[],

    },
    exportProject: {
        "method": "GET",
        "path": "/test/exportproject",
        "param": <{
            project: string
        }>{},
        "data": {},

    },
    importProject: {
        "method": "POST",
        "path": "/test/importproject",
        "param": <{
            content: string,
            team?: string,
            project?: string
        }>{},
        "data": <IRes_Test_ImportProject>{},

    },
    exportModule: {
        "method": "GET",
        "path": "/test/exportmodule",
        "param": <{
            module: string
        }>{},
        "data": {},

    },
    importModule: {
        "method": "POST",
        "path": "/test/importmodule",
        "param": <{
            content: string,
            project: string
        }>{},
        "data": <IRes_Test_ImportModule>{},

    },
    exportGroup: {
        "method": "GET",
        "path": "/test/exportgroup",
        "param": <{
            group: string
        }>{},
        "data": {},

    },
    importGroup: {
        "method": "POST",
        "path": "/test/importgroup",
        "param": <{
            content: string,
            module: string
        }>{},
        "data":<IRes_Test_ImportGroup> {},

    },
    exportTest: {
        "method": "GET",
        "path": "/test/exporttest",
        "param": <{
            test: string
        }>{},
        "data": {},

    },
    importTest: {
        "method": "POST",
        "path": "/test/importtest",
        "param": <{
            content: string,
            group: string
        }>{},
        "data": <IRes_Test_ImportTest>{},

    },
    pasteTest: {
        "method": "POST",
        "path": "/test/pastetest",
        "param": <{
            test: string,
            group: string
        }>{},
        "data": <IRes_Test_PasteTest>{},

    },
}

export = api
