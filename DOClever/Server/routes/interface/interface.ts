/**
 * Created by sunxin on 2016/11/20.
 */


import e=require("../../util/error.json");
import util=require("../../util/util");
import uuid=require("uuid");
import {api, user} from "../generateParams";
import interfaceApi = require("../../../Common/routes/interface")
import {keys} from "../../../Common/transform";
import {IKoa_ctx} from "../../types/global";
import interfaceDao=require("../../dao/interfaceDao")
class Interface {
constructor(private dao=interfaceDao) {
}
    @user
@api(interfaceApi.create,keys<typeof interfaceApi.create.param>())
async create (ctx:IKoa_ctx<typeof interfaceApi.create>){
        let obj=await this.dao.create(ctx.state.p.id,ctx.state.p.project,ctx.state.p.url,ctx.state.p.method,ctx.state.p,ctx.state.p.autosave,ctx.state.p.group,ctx.state.user._id.toString(),ctx)
        return obj;
    }

    @user
@api(interfaceApi.remove,keys<typeof interfaceApi.remove.param>())
async remove (ctx:IKoa_ctx<typeof interfaceApi.remove>){
        let obj=await this.dao.remove(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
        return obj
    }

    @user
@api(interfaceApi.move,keys<typeof interfaceApi.move.param>())
async move (ctx:IKoa_ctx<typeof interfaceApi.move>){
        let obj=await this.dao.move(ctx.state.p.id,ctx.state.p.group,ctx.state.p.index,ctx.state.user._id.toString(),ctx)
        return obj
    }

    @user
@api(interfaceApi.item,keys<typeof interfaceApi.item.param>())
async info (ctx:IKoa_ctx<typeof interfaceApi.item>){
        let obj=await this.dao.info(ctx.state.p.id,ctx.state.p.project,ctx.state.p.group,ctx.state.p.run,ctx.state.user._id.toString(),ctx)
        return obj
    }

    @user
@api(interfaceApi.share,keys<typeof interfaceApi.share.param>())
async share (ctx:IKoa_ctx<typeof interfaceApi.share>){
        let obj=await this.dao.share(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
        return obj
    }

    @user
@api(interfaceApi.destroy,keys<typeof interfaceApi.destroy.param>())
async destroy (ctx:IKoa_ctx<typeof interfaceApi.destroy>){
        let obj=await this.dao.destroy(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
        return obj
    }

    @user
@api(interfaceApi.exportJSON,keys<typeof interfaceApi.exportJSON.param>())
async exportJSON (ctx:IKoa_ctx<typeof interfaceApi.exportJSON>){
        let {headers,content}=await this.dao.exportJSON(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
        ctx.set(headers)
        return content
    }

    @user
@api(interfaceApi.importJSON,keys<typeof interfaceApi.importJSON.param>())
async importJSON (ctx:IKoa_ctx<typeof interfaceApi.importJSON>){
        let obj=await this.dao.importJSON(ctx.state.p.group,ctx.state.p.json,ctx.state.user._id.toString(),ctx)
        return obj
    }

    @user
@api(interfaceApi.editSnapshot,keys<typeof interfaceApi.editSnapshot.param>())
async createSnapshot (ctx:IKoa_ctx<typeof interfaceApi.editSnapshot>){
        let obj=await this.dao.createSnapshot(ctx.state.p.id,ctx.state.p.dis,ctx.state.user._id.toString(),ctx)
        return obj
    }

    @user
@api(interfaceApi.snapshotList,keys<typeof interfaceApi.snapshotList.param>())
async snapshotList (ctx:IKoa_ctx<typeof interfaceApi.snapshotList>){
        let obj=await this.dao.snapshotList(ctx.state.p.id,ctx.state.p.page,ctx.state.user._id.toString(),ctx)
        return obj
    }

    @user
@api(interfaceApi.removeSnapshot,keys<typeof interfaceApi.removeSnapshot.param>())
async removeSnapshot (ctx:IKoa_ctx<typeof interfaceApi.removeSnapshot>){
        await this.dao.removeSnapshot(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
    }

    @user
@api(interfaceApi.snapshotRoll,keys<typeof interfaceApi.snapshotRoll.param>())
async snapshotRoll (ctx:IKoa_ctx<typeof interfaceApi.snapshotRoll>){
        await this.dao.snapshotRoll(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
    }
    @user
@api(interfaceApi.notify,keys<typeof interfaceApi.notify.param>())
async notify (ctx:IKoa_ctx<typeof interfaceApi.notify>){
        await this.dao.notify(ctx.state.p.id,ctx.state.p.users,ctx.state.p.content,ctx.state.user._id.toString(),ctx.state.user,ctx)

    }
    @user
@api(interfaceApi.merge,keys<typeof interfaceApi.merge.param>())
async merge (ctx:IKoa_ctx<typeof interfaceApi.merge>){
        let obj=await this.dao.merge(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
        return obj
    }
    @user
@api(interfaceApi.docRef,keys<typeof interfaceApi.docRef.param>())
async docRef (ctx:IKoa_ctx<typeof interfaceApi.docRef>){
        let obj=await this.dao.docRef(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
        return obj
    }
    @user
@api(interfaceApi.param,keys<typeof interfaceApi.param.param>())
async getParam (ctx:IKoa_ctx<typeof interfaceApi.param>){
        let obj=await this.dao.getParam(ctx.state.p.id,ctx.state.p.param,ctx.state.user._id.toString(),ctx)
        return obj
    }
}


export=new Interface;







