/**
 * Created by sunxin on 2017/6/26.
 */


import e=require("../../util/error.json");
import util=require("../../util/util");
import {api, user} from "../generateParams";
import versionApi = require("../../../Common/routes/version")
import {keys} from "../../../Common/transform";
import versionDao=require("../../dao/versionDao");
import {IKoa_ctx} from "../../types/global";
class Version {
    constructor(private dao=versionDao) {
    }
    @user
@api(versionApi.save,keys<typeof versionApi.save.param>())
async save (ctx:IKoa_ctx<typeof versionApi.save>){
    let obj=await this.dao.save(ctx.state.p.id,ctx.state.p.project,ctx.state.p.version,ctx.state.p.dis,ctx.state.user._id.toString(),ctx)
        return obj
    }

    @user
@api(versionApi.list,keys<typeof versionApi.list.param>())
async list (ctx:IKoa_ctx<typeof versionApi.list>){
    let obj=await this.dao.list(ctx.state.p.project,ctx.state.p.page,ctx.state.user._id.toString(),ctx)
    return obj
    }

    @user
@api(versionApi.remove,keys<typeof versionApi.remove.param>())
async remove (ctx:IKoa_ctx<typeof versionApi.remove>){
    await this.dao.remove(ctx.state.p.id,ctx.state.user._id.toString(),ctx)

    }

    @user
@api(versionApi.roll,keys<typeof versionApi.roll.param>())
async roll (ctx:IKoa_ctx<typeof versionApi.roll>){
    await this.dao.roll(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
    }

}

export=new Version;












