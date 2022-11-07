import {ICommon_Poll} from "./types";

export interface IRes_Poll_Save extends ICommon_Poll{
    project:string
    users:string[]
    owner:string
    test:string[]
    interProject:string
}

export interface IRes_Poll_Info extends Omit<IRes_Poll_Save, "users"> {
    users:{
        _id:string,
        name:string,
        photo:string
    }[]
}