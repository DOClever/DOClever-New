import {
    ICommon_Doc,
    ICommon_DocGroup,
    ICommon_DocProject,
    ICommon_Interface,
    ICommon_User,
    ICommon_Project_BaseUrl,
    ICommon_Status
} from "./types";

export interface IRes_Doc_EditProject extends Omit<ICommon_DocProject,"users"|"childGroup"|"owner"|"team">{
    users:string[]
    owner:string
    childGroup: string[],
    team:string
    userCount?:number,
    docCount?:number,
    own?:number,
    role?:number
}


export interface IRes_Doc_ProjectList_Item extends Omit<ICommon_DocProject,"group"|"project"|"owner"|"editor">{
    owner:string
    childGroup: string[],
    team:string
    userCount:number,
    docCount:number,
    own?:number,
    role:number
}

export interface IRes_Doc_ProjectList {
    join:IRes_Doc_ProjectList_Item[],
    create:IRes_Doc_ProjectList_Item[],
    public:IRes_Doc_ProjectList_Item[]
}

export interface IRes_Doc_Project extends Omit<ICommon_DocProject,"users"|"childGroup"|"owner"|"team">{
    users:{
        _id:string,
        name:string,
        photo:string
    }[]
    owner:{
        name:string,
        photo:string
    }
    childGroup: string[],
    team:string
}

export interface IRes_Doc_EditGroup extends Omit<ICommon_DocGroup, "parent"|"project"|"childGroup"|"childDoc">{
    parent: string
    project:string
    childGroup: string[]
    childDoc:string[]
}

export interface IRes_Doc_EditDoc extends Omit<ICommon_Doc,"group"|"project"|"owner"|"editor">{
    group:string
    project:string
    owner:string
    editor: string
}


export interface IRes_Doc_Doc extends Omit<ICommon_Doc,"group"|"project"|"owner"|"editor">{
    group:string
    project:{
        _id:string,
        name:string,
        team:{
            _id:string,
            name:string
        }
    }
    owner:{
        _id:string,
        name:string,
        photo:string
    }
    editor: {
        _id:string,
        name:string,
        photo:string
    }
}


export type IRes_Doc_MoveGroup =IRes_Doc_EditGroup

export type IRes_Doc_MoveDoc =IRes_Doc_EditDoc

export interface IRes_Doc_Structure extends Omit<ICommon_DocProject,"users"|"childGroup"|"owner"|"team">{
    users:string[]
    owner:string
    childGroup: IRes_Doc_Structure_Group[],
    team:string
}

export interface IRes_Doc_Structure_Group extends Omit<ICommon_DocGroup, "parent"|"project"|"childGroup"|"childDoc">{
    parent: string
    project:string
    childGroup: IRes_Doc_Structure_Group[]
    childDoc:IRes_Doc_Structure_Doc[]
}

export interface IRes_Doc_Structure_Doc extends Omit<ICommon_Doc,"group"|"project"|"owner"|"editor"|"content"|"img"|"file"|"interface">{
    group:string
    project:string
    owner:{
        _id:string,
        name:string
    }
    editor: {
        _id:string,
        name:string
    }
}

export interface IRes_Doc_FilterList_Item extends Omit<ICommon_DocProject,"totalSize"|"useSize"|"childGroup"|"team"|"publicTeam"|"public"|"users"|"owner">{
    open:number
}

export type IRes_Doc_FilterList=IRes_Doc_FilterList_Item[]

export interface IRes_Doc_Interface extends Omit<ICommon_Interface, "project"|"group"|"owner"|"editor"|"version"|"snapshotCreator"|"snapshot">{
    project:{
        _id:string,
        name:string,
        baseUrls:ICommon_Project_BaseUrl[]
    },
    group:{
        _id:string,
        name:string
    },
    owner:{
        _id:string,
        name:string
    },
    editor:{
        _id:string,
        name:string
    },
    version:{
        _id:string,
        name:string
    }
}

export interface IRes_Doc_InterfaceInfo_Status extends Omit<ICommon_Status, "project">{
    project:string
}

export interface IRes_Doc_InterfaceInfo {
    before:string,
    after:string,
    status:IRes_Doc_InterfaceInfo_Status[],
    baseUrls:ICommon_Project_BaseUrl[]
}





