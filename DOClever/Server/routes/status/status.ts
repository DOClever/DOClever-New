/**
 * Created by sunxin on 2017/4/13.
 */


import e=require("../../util/error.json");
import util=require("../../util/util");
import uuid=require("uuid");
import {api, user} from "../generateParams";
import statusApi = require("../../../Common/routes/status")
import {keys} from "../../../Common/transform";
import statusDao=require("../../dao/statusDao")
import {IKoa_ctx} from "../../types/global";
class Status {
    constructor(private dao=statusDao) {
    }

    @user
@api(statusApi.save,keys<typeof statusApi.save.param>())
async save (ctx:IKoa_ctx<typeof statusApi.save>){
    let obj=await this.dao.save(ctx.state.p.id,ctx.state.p.name,ctx.state.p.project,ctx.state.p.data,ctx)
    return obj
    }

    @user
@api(statusApi.remove,keys<typeof statusApi.remove.param>())
async remove (ctx:IKoa_ctx<typeof statusApi.remove>){
    await this.dao.remove(ctx.state.p.id,ctx)

    }

    @user
@api(statusApi.list,keys<typeof statusApi.list.param>())
async list (ctx:IKoa_ctx<typeof statusApi.list>){
    let obj=await this.dao.list(ctx.state.p.id,ctx)
    return obj
    }

    @user
@api(statusApi.exportJSON,keys<typeof statusApi.exportJSON.param>())
async exportJSON (ctx:IKoa_ctx<typeof statusApi.exportJSON>){
    let {headers,content}=await this.dao.exportJSON(ctx.state.p.id,ctx)
        ctx.set(headers)
        return content
    }

    @user
@api(statusApi.importJSON,keys<typeof statusApi.importJSON.param>())
async importJSON (ctx:IKoa_ctx<typeof statusApi.importJSON>){
    let obj=await this.dao.importJSON(ctx.state.p.project,ctx.state.p.json,ctx)
        return obj

    }
}

export=new Status;









