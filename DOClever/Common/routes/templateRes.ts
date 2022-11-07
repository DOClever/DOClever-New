import {ICommon_Template} from "./types";

export interface IRes_Template_Edit extends ICommon_Template {
    project:string,
    version:string
}

export interface IRes_Template_List_Item {
    _id:string,
    name:string,
    createdAt:string
}