import {
    ICommon_Apply, ICommon_Team,
    ICommon_User
} from "./types";

export type IRes_User_Login = Omit<ICommon_User, "password"|"question"|"answer">

export type IRes_User_CreateQQ = Omit<ICommon_User, "password">
export type IRes_User_Save=IRes_User_CreateQQ

export interface IRes_User_ApplyList_Item extends Omit<ICommon_Apply,"creator"|"from">{
    from:{
        _id:string,
        name:string
    }
    type:0
    state:0
    creator:{
        _id:string,
        name:string,
        photo:string
    }
    editor:string
}

export interface IRes_User_HandleApply extends ICommon_Team {
    owner:string,
    userCount:number,
    project:number
}

export interface IRes_User_Version {
    version:string,
    url:string
}
