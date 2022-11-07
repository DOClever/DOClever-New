import {
    ICommon_Apply,
    ICommon_DocProject,
    ICommon_Project,
    ICommon_Team,
    ICommon_TeamGroup,
    ICommon_TestProject,
    ICommon_User
} from "./types";

export interface IRes_Team_Save extends ICommon_Team{
    owner:string,
    userCount?:number,
    projectCount?:number,
    docCount?:number,
    testCount?:number,
    role?:number,
    own?:number
}

export interface IRes_Team_Info_Project {
    name:string,
    dis:string,
    createdAt:string,
    _id:string,
    role:number,
    own:number,
    userCount:number,
    interfaceCount:number
}

export interface IRes_Team_Info_DocProject extends ICommon_DocProject{
    users:string[],
    owner:string,
    childGroup:string[],
    team:string,
    role:number,
    own:number,
    userCount:number,
    docCount:number
}

export interface IRes_Team_Info_TestProject extends ICommon_TestProject{
    users:string[],
    owner:string,
    cooperation:{
        user:string
        users:string[]
    }[],
    team:string,
    role:number,
    own:number,
    userCount:number,
    testCount:number
}

export interface IRes_Team_Info_TeamGroup extends Omit<ICommon_TeamGroup,"users"> {
    team:string,
    users:{
        role:number,
        user:{
            _id:string,
            name:string,
            photo:string
        }
    }[]
}

export interface IRes_Team_Info extends Omit<ICommon_Team,"owner">{
    owner:{
        _id:string,
        name:string,
        photo:string
    },
    interfaceCount:number,
    projectCount:number,
    project:IRes_Team_Info_Project[],
    docCount:number,
    doc:IRes_Team_Info_DocProject[],
    testCount:number,
    test:IRes_Team_Info_TestProject[],
    userCount:number,
    role:number,
    user:IRes_Team_Info_TeamGroup[]
}

export interface IRes_Team_RemoveProjectUser_Project extends ICommon_Project{
    owner:string,
    users:{
        user:string
        role:number
        option:any
    }[],
    team:string
}

export interface IRes_Team_projectUser_Item extends Omit<ICommon_TeamGroup,"users"> {
    team:string,
    users:{
        user:{
            select:number,
            _id:string,
            name:string,
            photo:string
        },
        role:number,
    }
}

export interface IRes_Team_MoveUser {
    role:number,
    user:{
        _id:string,
        name:string,
        photo:string
    }
}

export interface IRes_Team_ApplyInfo_Item extends Omit<ICommon_Apply,"creator"|"from"|"to">{
    type:2|3,
    state:0,
    creator:{
        _id:string,
        name:string,
        photo:string
    },
    from:{
        _id:string,
        name:string
    },
    to:{
        _id:string,
        name:string
    },
    editor:string
}

export interface IRes_Team_UserPulledList_Item {
    _id:string,
    name:string,
    photo:string
}

export interface IRes_Team_List_Create_Item extends ICommon_Team{
    owner:string,
    role:number,
    own:number,
    userCount:number,
    projectCount:number,
    docCount:number,
    testCount:number
}

export type IRes_Team_List_Join_Item=IRes_Team_List_Create_Item
export interface IRes_Team_List {
    join:IRes_Team_List_Join_Item[],
    create:IRes_Team_List_Create_Item[]
}

export interface IRes_Team_ProjectList_Item {
    name:string,
    dis:string,
    _id:string,
    createdAt:string,
    role:number,
    own:number,
    userCount:number,
    interfaceCount:number
}

export interface IRes_Team_DocList_Item extends ICommon_DocProject{
    owner:string,
    childGroup:string[],
    team:string,
    role:number,
    own:number,
    docCount:number,
    userCount:number
}

export interface IRes_Team_TestList_Item extends ICommon_TestProject{
    owner:string,
    cooperation:{
        user: string
        users: string[]
    }[]
    team:string,
    role:number,
    own:number,
    testCount:number,
    userCount:number
}

export interface IRes_Team_DocUser_Item extends Omit<ICommon_TeamGroup,"users"> {
    team:string,
    users:{
        role:number,
        user:{
            _id:string,
            name:string,
            photo:string
        },
        select:number
    }[]
}

export type IRes_Team_TestUser_Item=IRes_Team_DocUser_Item











