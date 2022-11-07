/**
 * Created by sunxin on 2017/7/5.
 */


import e=require("../../util/error.json");
import util=require("../../util/util");
import {api, user} from "../generateParams";
import pollApi = require("../../../Common/routes/poll")
import {keys} from "../../../Common/transform";
import pollDao=require("../../dao/pollDao")
import {IKoa_ctx} from "../../types/global";
class  Poll {
    constructor(private dao=pollDao) {
    }
    @user
@api(pollApi.save,keys<typeof pollApi.save.param>())
async save (ctx:IKoa_ctx<typeof pollApi.save>){
        let obj=await this.dao.save(ctx.state.p.id,ctx.state.p.project,ctx.state.p.collection,ctx.state.p.users,ctx.state.p.date,ctx.state.p.time,ctx.state.p.user,ctx.state.p.password,ctx.state.p.smtp,ctx.state.p.port,ctx.state.p.url,ctx.state.p.failsend,ctx.state.p.phoneinfo,ctx.state.p.owner,ctx.state.p.interproject,ctx.state.p.immediate)
        return obj
    }

    @user
@api(pollApi.remove,keys<typeof pollApi.remove.param>())
async remove (ctx:IKoa_ctx<typeof pollApi.remove>){
    await this.dao.remove(ctx.state.p.id)

    }

    @user
@api(pollApi.item,keys<typeof pollApi.item.param>())
async info (ctx:IKoa_ctx<typeof pollApi.item>){
    let obj=await this.dao.info(ctx.state.p.id)
    return obj
    }
}

export=new Poll;
