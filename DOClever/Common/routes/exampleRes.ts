import {ICommon_Example} from "./types";

export interface IRes_Example_EditItem extends Omit<ICommon_Example, "project"|"interface"|"owner">{
    project:string,
    interface:string,
    owner:string
}

export type IRes_Example_Item=IRes_Example_EditItem

export interface IRes_Example_AllList {
    [id:string]:IRes_Example_Item[]
}
