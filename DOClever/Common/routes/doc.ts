import {IRes_Doc_EditProject, IRes_Doc_ProjectList, IRes_Doc_Project, IRes_Doc_EditGroup, IRes_Doc_EditDoc, IRes_Doc_Doc, IRes_Doc_MoveGroup, IRes_Doc_MoveDoc, IRes_Doc_Structure, IRes_Doc_FilterList, IRes_Doc_Interface, IRes_Doc_InterfaceInfo} from "./docRes";
import {ICommon_User} from "./types";

const api = {
    editProject: {
        "method": "POST",
        "path": "/doc/project",
        "param": <{
            project?: string,
            name: string,
            dis?: string,
            team?: string,
            public?: number,
            publicteam?: number
        }>{},
        "data": <IRes_Doc_EditProject>{},

    },
    projectList: {
        "method": "GET",
        "path": "/doc/projectlist",
        "param": <{}>{},
        "data": <IRes_Doc_ProjectList[]>[],

    },
    project: {
        "method": "GET",
        "path": "/doc/project",
        "param": <{
            project: string
        }>{},
        "data": <IRes_Doc_Project>{},
    },
    removeProject: {
        "method": "DELETE",
        "path": "/doc/project",
        "param": <{
            project: string
        }>{},
        "data": {},

    },
    editGroup: {
        "method": "POST",
        "path": "/doc/group",
        "param": <{
            group?: string,
            project: string,
            name: string,
            parent?: string
        }>{},
        "data": <IRes_Doc_EditGroup>{},

    },
    removeGroup: {
        "method": "DELETE",
        "path": "/doc/group",
        "param": <{
            group: string
        }>{},
        "data": <number>{},

    },
    editDoc: {
        "method": "POST",
        "path": "/doc/doc",
        "param": <{
            id?: string,
            name: string,
            group: string,
            project: string,
        }>{},
        "data": <IRes_Doc_EditDoc>{},

    },
    doc: {
        "method": "GET",
        "path": "/doc/doc",
        "param": <{
            id: string,
        }>{},
        "data": <IRes_Doc_Doc>{},
    },
    removeDoc: {
        "method": "DELETE",
        "path": "/doc/doc",
        "param": <{
            id: string,
        }>{},
        "data": {},

    },
    moveGroup: {
        "method": "PUT",
        "path": "/doc/movegroup",
        "param": <{
            group: string,
            to?: string,
            index: number
        }>{},
        "data": <IRes_Doc_MoveGroup>{},

    },
    moveDoc: {
        "method": "PUT",
        "path": "/doc/movedoc",
        "param": <{
            id: string,
            to: string,
            index: number
        }>{},
        "data": <IRes_Doc_MoveDoc>{},

    },
    addUser: {
        "method": "POST",
        "path": "/doc/user",
        "param": <{
            project: string,
            user: string
        }>{},
        "data": <ICommon_User>{},

    },
    removeUser: {
        "method": "DELETE",
        "path": "/doc/user",
        "param": <{
            project: string,
            user: string
        }>{},
        "data": {},

    },
    editUser: {
        "method": "PUT",
        "path": "/doc/user",
        "param": <{
            project: string,
            user: string
        }>{},
        "data": {},

    },
    quit: {
        "method": "DELETE",
        "path": "/doc/quit",
        "param": <{
            project: string,
        }>{},
        "data": {},

    },
    setOwner: {
        "method": "PUT",
        "path": "/doc/owner",
        "param": <{
            project: string,
            user: string
        }>{},
        "data": {},

    },
    structure: {
        "method": "GET",
        "path": "/doc/structure",
        "param": <{
            project: string
        }>{},
        "data": <IRes_Doc_Structure>{},
    },
    filterStructure: {
        "method": "GET",
        "path": "/doc/filterstructure",
        "param": <{
            project: string,
            key?: string,
            type: number
        }>{},
        "data": <IRes_Doc_Structure>{},
    },
    filterList: {
        "method": "GET",
        "path": "/doc/filterlist",
        "param": <{
            team?: string,
            name?: string
        }>{},
        "data": <IRes_Doc_FilterList>{},

    },
    handleApply: {
        "method": "PUT",
        "path": "/doc/handleapply",
        "param": <{
            project: string,
            apply: string,
            state: number
        }>{},
        "data": {},

    },
    interface: {
        "method": "GET",
        "path": "/doc/interface",
        "param": <{
            id: string
        }>{},
        "data": <IRes_Doc_Interface>{},
    },
    interfaceInfo: {
        "method": "GET",
        "path": "/doc/interfaceInfo",
        "param": <{
            id: string
        }>{},
        "data": <IRes_Doc_InterfaceInfo>{},
    },
    exportpdf: {
        "method": "GET",
        "path": "/doc/exportpdf",
        "param": <{
            project: string
        }>{},
        "data": {},
    },
}

export = api
