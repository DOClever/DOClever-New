import {ICommon_Apply, ICommon_Base, ICommon_Group, ICommon_Project, ICommon_User} from "./types";
import {IRes_Group_Create_Group} from "./groupRes";

export interface IRes_Project_Create extends ICommon_Project{
    owner:string,
    team:string,
    users:{
        user:string
        role:number
        option:any
    }[],
    role?:0,
    userCount?:1,
    interfaceCount?:0,
    own?:1
}

export interface IRes_Project_EditMember {
    role:number,
    user:ICommon_User,
    option?:any
}

export interface IRes_Project_List_Create_Item extends ICommon_Project{
    owner:string,
    user:{
        user:string
        role:number
        option:any
    }[],
    team:string,
    role:0,
    own:1,
    userCount:number,
    interfaceCount:number
}


export interface IRes_Project_List_Join_Item extends ICommon_Project{
    owner:string,
    user:{
        user:string
        role:number
        option:any
    }[],
    team:string,
    role:0|1,
    own:0,
    userCount:number,
    interfaceCount:number
}

export interface IRes_Project_List_Public_Item extends ICommon_Project{
    owner:string,
    user:{
        user:string
        role:number
        option:any
    }[],
    team:string,
    role:1,
    own:0,
    userCount:number,
    interfaceCount:number
}

export interface IRes_Project_List {
    create:IRes_Project_List_Create_Item[],
    join:IRes_Project_List_Join_Item[],
    public:IRes_Project_List_Public_Item[]
}

export interface IRes_Project_FilterList_Item extends ICommon_Base{
    name:string,
    dis:string,
    users?:{
        user:string
        role:number
        option:any
    }[],
    own:0|1,
    role:0|1
}

export interface IRes_Project_Info_User extends Omit<ICommon_User, "password"|"question"|"answer">{
    
}

export interface IRes_Project_Info extends Omit<ICommon_Project,"users">{
    users:{
        user:IRes_Project_Info_User
        role:number
        option:any
    }[],
    owner:string,
    team:string,
    baseUrls:any[],
    before:string,
    after:string,
    source:any
}

export interface IRes_Project_Group_Item extends ICommon_Group{
    project:string,
    version:string,
    data:IRes_Project_Group_Item[]
}

export interface IRes_Project_ImportJSON extends ICommon_Project {
    owner:string,
    user:{
        user:string
        role:number
        option:any
    }[],
    team:string,
    role:0,
    userCount:1,
    own:1,
    interfaceCount:number
}

export interface IRes_Project_ImportMemberInfo_Item extends ICommon_Base {
    name:string,
    photo:string
}

export interface IRes_Project_ApplyList_Item extends Omit<ICommon_Apply,"from"|"creator"> {
    from:{
        _id:string,
        name:string
    },
    to:string,
    creator:{
        _id:string,
        name:string,
        photo:string
    },
    editor:string
}

export type IRes_Project_Users_Item=IRes_Project_ImportMemberInfo_Item

export type IRes_Project_ImportRap=IRes_Project_ImportJSON
export type IRes_Project_ImportSwagger=IRes_Project_ImportJSON
export type IRes_Project_ImportPostMan=IRes_Project_ImportJSON








