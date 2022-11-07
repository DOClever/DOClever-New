import {Context, Request} from "koa";
import {InstanceType} from "typegoose";
import {AdminModel, UserModel} from "../model/types";

export interface IKoa_ctx<T extends any = any> extends Context{
    state:{
        p:T["param"],
        user:InstanceType<UserModel>,
        f?:any,
        data?:any,
        response:T["data"],
        admin:InstanceType<AdminModel>
    },
    session?:any,
    request:Request & {handle:any}
}

export interface IInterface_func {
    (ctx:IKoa_ctx):Promise<void|boolean>
}

export interface IInterface_structure {
    method:string,
    path:string,
    param:object,
    data:any,
    user?:number,
    admin?:number,
    handle:IInterface_func & IInterface_func[]
}
export interface IError_info
{
    code:number,
    ch:string,
    en:string
}
