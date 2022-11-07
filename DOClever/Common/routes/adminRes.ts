import {ICommon_DocProject, ICommon_Project, ICommon_TestProject} from "./types";

export interface IRes_Admin_ProjectList_Project extends Omit<ICommon_Project,"owner" | "team" |"users">{
    owner: {
        _id:string,
        name:string,
        photo:string
    }
    users:{
        user:string
        role:number
        option:any
    }[]
    team:{
        _id:string,
        name:string
    }
    userCount:number,
    interfaceCount:number
}

export interface IRes_Admin_ProjectList_DocProject extends Omit<ICommon_DocProject,"owner" | "team" |"users"|"childGroup"> {
    users:string[]
    owner:{
        _id:string,
        name:string,
        photo:string
    }
    totalSize:number
    useSize:number
    childGroup:string[]
    team:{
        _id:string,
        name:string
    },
    userCount:number,
    docCount:number
}

export interface IRes_Admin_ProjectList_TestProject extends Omit<ICommon_TestProject,"owner" | "team" |"users"|"cooperation"> {
    users:string[]
    owner:{
        _id:string,
        name:string,
        photo:string
    }
    team:{
        _id:string,
        name:string
    }
    cooperation:{
        user:string
        users:string[]
    }[],
    userCount:number,
    testCount:number
}
export type IRes_Admin_ProjectList=IRes_Admin_ProjectList_Project[] | IRes_Admin_ProjectList_DocProject[] | IRes_Admin_ProjectList_TestProject[]

export type IRes_Admin_GetProject_Project =Omit<IRes_Admin_ProjectList_Project, "userCount"|"interfaceCount">
export type IRes_Admin_GetProject_DocProject=Omit<IRes_Admin_ProjectList_DocProject,"userCount"|"docCount">

export type IRes_Admin_GetProject_TestProject =Omit<IRes_Admin_ProjectList_TestProject, "userCount"|"testCount">

export type IRes_Admin_GetProject=IRes_Admin_GetProject_Project[]|IRes_Admin_GetProject_DocProject[]|IRes_Admin_GetProject_TestProject[]

export interface IRes_Admin_TeamPullProject_Project extends Omit<ICommon_Project,"owner" | "team" |"users">{
    owner: string
    team:string
    userCount:number,
    interfaceCount:number
}

export interface IRes_Admin_TeamPullProject_DocProject extends Omit<ICommon_DocProject,"owner" | "team" |"users"|"childGroup"> {
    owner:string
    childGroup:string[]
    team:string,
    userCount:number,
    docCount:number
}
export interface IRes_Admin_TeamPullProject_TestProject extends Omit<ICommon_TestProject,"owner" | "team" |"users"|"cooperation"> {
    owner:string
    team:string
    cooperation:{
        user:string
        users:string[]
    }[],
    userCount:number,
    testCount:number
}

export type IRes_Admin_TeamPullProject=IRes_Admin_TeamPullProject_Project | IRes_Admin_TeamPullProject_DocProject | IRes_Admin_TeamPullProject_TestProject


export interface IRes_Admin_ProjectUserList_Project extends Omit<ICommon_Project,"owner" | "team" |"users">{
    owner: string
    team:string
    userCount:number,
    interfaceCount:number,
    users:{
        user:{
            _id:string,
            name:string,
            photo:string
        }
        role:number
        option:any
    }[]
}

export interface IRes_Admin_ProjectUserList_DocProject extends Omit<ICommon_DocProject,"owner" | "team" |"users"|"childGroup"> {
    owner:string
    childGroup:string[]
    team:string,
    userCount:number,
    docCount:number,
    users:{
        _id:string,
        name:string,
        photo:string
    }[]
}
export interface IRes_Admin_ProjectUserList_TestProject extends Omit<ICommon_TestProject,"owner" | "team" |"users"|"cooperation"> {
    owner:string
    team:string
    cooperation:{
        user:string
        users:string[]
    }[],
    userCount:number,
    testCount:number,
    users:{
        _id:string,
        name:string,
        photo:string
    }[]
}

export type IRes_Admin_ProjectUserList=IRes_Admin_ProjectUserList_Project | IRes_Admin_ProjectUserList_DocProject | IRes_Admin_ProjectUserList_TestProject

export interface IRes_Admin_TeamProjectList_Project extends Omit<ICommon_Project,"owner" | "team" |"users">{
    owner: {
        _id:string,
        name:string
    }
    team:string
    userCount:number,
    interfaceCount:number,
}






