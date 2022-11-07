import {ICommon_Project, ICommon_User, ICommon_Version} from "./types";

export interface IRes_Version_Save extends Omit<ICommon_Version,"creator"> {
    project:string
    creator:{
        _id:string,
        name:string,
        photo:string
    }
}