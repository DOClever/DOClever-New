/**
 * Created by sunxin on 2017/7/7.
 */

import util=require("../../util/util");
import {api, user} from "../generateParams";
import messageApi = require("../../../Common/routes/message")
import {keys} from "../../../Common/transform";
import {IKoa_ctx} from "../../types/global";
import messageDao=require("../../dao/messageDao")
class  Message {
    constructor(private dao=messageDao) {
    }
    @user
@api(messageApi.remove,keys<typeof messageApi.remove.param>())
async remove (ctx:IKoa_ctx<typeof messageApi.remove>){
        await this.dao.remove(ctx.state.p.id)

    }

    @user
@api(messageApi.list,keys<typeof messageApi.list.param>())
async list (ctx:IKoa_ctx<typeof messageApi.list>){
        let obj=await this.dao.list(ctx.state.p.page,ctx.state.user._id.toString())
        return obj
    }

    @user
@api(messageApi.clear,keys<typeof messageApi.clear.param>())
async clear (ctx:IKoa_ctx<typeof messageApi.clear>){
        await this.dao.clear(ctx.state.user._id.toString())

    }

    @user
@api(messageApi.new,keys<typeof messageApi.new.param>())
async newMsg (ctx:IKoa_ctx<typeof messageApi.new>){
        let obj=await this.dao.newMsg(ctx.state.user._id.toString())
        return obj
    }
    @user
@api(messageApi.applyList,keys<typeof messageApi.applyList.param>())
async applyList (ctx:IKoa_ctx<typeof messageApi.applyList>){
        let obj=await this.dao.applyList(ctx.state.user._id.toString())
        return obj
    }
}


export=new Message;







