/**
 * Created by sunxin on 2016/11/17.
 */


import e=require("../../util/error.json");
import util=require("../../util/util");
import uuid=require("uuid");
import {api, user} from "../generateParams";
import groupApi = require("../../../Common/routes/group")
import {keys} from "../../../Common/transform";
import {IKoa_ctx} from "../../types/global";
import groupDao=require("../../dao/groupDao")
class Group {
    constructor(private group=groupDao) {
    }
    @user
@api(groupApi.create,keys<typeof groupApi.create.param>())
async create (ctx:IKoa_ctx<typeof groupApi.create>){
        let obj=await this.group.create(ctx.state.p.name,ctx.state.p.id,ctx.state.p.group,ctx.state.p.parent,ctx.state.user._id.toString(),ctx.state.p.import,ctx)
        return obj;
    }

    @user
@api(groupApi.remove,keys<typeof groupApi.remove.param>())
async remove (ctx:IKoa_ctx<typeof groupApi.remove>){
    await this.group.remove(ctx.state.user._id.toString(),ctx)
    }
    @user
@api(groupApi.exportJSON,keys<typeof groupApi.exportJSON.param>())
async exportJSON (ctx:IKoa_ctx<typeof groupApi.exportJSON>){
    let {headers,content}=await this.group.exportJSON(ctx.state.p.group,ctx.state.user._id.toString(),ctx)
    ctx.set(headers)
    return content
    }

    @user
@api(groupApi.importJSON,keys<typeof groupApi.importJSON.param>())
async importJSON (ctx:IKoa_ctx<typeof groupApi.importJSON>){
        let obj=await this.group.importJSON(ctx.state.p.id,ctx.state.p.group,ctx.state.p.json,ctx.state.user._id.toString(),ctx)
        return obj
    }
    @user
@api(groupApi.move,keys<typeof groupApi.move.param>())
async move (ctx:IKoa_ctx<typeof groupApi.move>){
    let obj=await this.group.move(ctx.state.p.group,ctx.state.p.to,ctx.state.p.index,ctx.state.user._id.toString(),ctx)
        return obj

    }
    @user
@api(groupApi.merge,keys<typeof groupApi.merge.param>())
async merge (ctx:IKoa_ctx<typeof groupApi.merge>){
    let obj=await this.group.merge(ctx.state.p.group,ctx.state.user._id.toString(),ctx)
    return obj
    }
}


export=new Group;









