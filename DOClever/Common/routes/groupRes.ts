import {ICommon_Group, ICommon_Interface} from "./types";

export interface IRes_Group_Create_Interface{
    _id:string
    name:string
    method:string
    finish:number
    url:string
    delete:number
}

export interface IRes_Group_Create_Group extends Omit<ICommon_Group, "project"|"version">{
    project:string,
    version:string,
    data:(IRes_Group_Create_Interface|IRes_Group_Create_Group)[]
}

export type IRes_Group_Create = (IRes_Group_Create_Group|IRes_Group_Create_Interface)[]

export type IRes_Group_ImportJSON=IRes_Group_Create
export type IRes_Group_Move=IRes_Group_Create
export type IRes_Group_Merge=IRes_Group_Create
