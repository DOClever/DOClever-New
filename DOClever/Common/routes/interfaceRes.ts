import {IRes_Group_Create_Interface} from "./groupRes";
import {ICommon_Group, ICommon_Interface, ICommon_Project_BaseUrl} from "./types";
import {IRes_Doc_Interface, IRes_Doc_EditDoc} from "./docRes";


export type IRes_Interface_Create_Interface =IRes_Group_Create_Interface

export interface IRes_Interface_Create_Group extends Omit<ICommon_Group, "project"|"version">{
    project:string,
    version:string,
    data:(IRes_Interface_Create_Interface|IRes_Interface_Create_Group)[]
}

export type IRes_Interface_Create_List=(IRes_Interface_Create_Interface|IRes_Interface_Create_Group)[]

export type IRes_Interface_Create_InterfaceItem=IRes_Doc_Interface

export type IRes_Interface_Create=IRes_Interface_Create_InterfaceItem|string|IRes_Interface_Create_List

export type IRes_Interface_Remove=IRes_Interface_Create_List

export type IRes_Interface_Destroy=IRes_Interface_Create_List
export type IRes_Interface_Move=IRes_Interface_Create_List

export interface IRes_Interface_Item extends Omit<ICommon_Interface, "project"|"group"|"owner"|"editor"|"version"|"snapshotCreator">{
    project:{
        _id:string,
        name:string
    }
    group:{
        _id:string,
        name:string
    }
    owner:{
        _id:string,
        name:string
    }
    editor:{
        _id:string,
        name:string
    }
    version:string,
    snapshotCreator:string
    change:number,
    baseUrl:ICommon_Project_BaseUrl[]
}

export interface IRes_Interface_Share extends Omit<ICommon_Interface, "project"|"group"|"owner"|"editor"|"version"|"snapshotCreator">{
    project:{
        _id:string,
        name:string
    }
    group:{
        _id:string,
        name:string
    }
    owner:{
        _id:string,
        name:string
    }
    editor:{
        _id:string,
        name:string
    },
    version:string,
    snapshotCreator:string
}

export type IRes_Interface_ImportJSON=IRes_Interface_Share

export type IRes_Interface_EditSnapshot=IRes_Interface_Share

export type IRes_Interface_Merge=IRes_Interface_Create_List

export type IRes_Interface_DocRef=IRes_Doc_EditDoc[]


