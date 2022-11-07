import {ICommon_Article} from "./types";

export interface IRes_Article_Save extends Omit<ICommon_Article, "project"|"creator">{
    project:string,
    creator:string
}


export interface IRes_Article_Info extends Omit<ICommon_Article, "project"|"creator">{
    project:string,
    creator:{
        _id:string,
        name:string,
        photo:string
    }
}


export interface IRes_Article_List_Info extends Omit<ICommon_Article, "project"|"creator"|"content">{
    project:string,
    creator:{
        _id:string,
        name:string,
        photo:string
    }
}
