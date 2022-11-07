/**
 * Created by sunxin on 2016/11/9.
 */


import e=require("../../util/error.json");
import util=require("../../util/util");
import {api, user} from "../generateParams";
import userApi = require("../../../Common/routes/user")
import {keys} from "../../../Common/transform";
import userDao=require("../../dao/userDao")
import {IKoa_ctx} from "../../types/global";
class User {
    constructor(private dao=userDao){

    }
@api(userApi.login,keys<typeof userApi.login.param>())
async login (ctx:IKoa_ctx<typeof userApi.login>){
    let obj=await this.dao.login(ctx.state.p.id,ctx.state.p.qqid,ctx.state.p.qqimg,ctx.state.p.name,ctx.state.p.password,ctx.session)
    return obj
    }
@api(userApi.createQQ,keys<typeof userApi.createQQ.param>())
async createQQ (ctx:IKoa_ctx<typeof userApi.createQQ>){
    let obj=await this.dao.createQQ(ctx.state.p.name,ctx.state.p.password,ctx.state.p.qqid,ctx.state.p.question,ctx.state.p.answer,ctx.state.p.email,ctx.state.p.qqimg)
    return obj
    }
@api(userApi.save,keys<typeof userApi.save.param>())
async save (ctx:IKoa_ctx<typeof userApi.save>){
    let obj=await this.dao.save(ctx.state.p.userid,ctx.state.p,ctx.state.p.photo)
    return obj
    }

@api(userApi.logout,keys<typeof userApi.logout.param>())
async logout (ctx:IKoa_ctx<typeof userApi.logout>){
    await this.dao.logout(ctx.session)

    }

    @user
@api(userApi.editPass,keys<typeof userApi.editPass.param>())
async editPass (ctx:IKoa_ctx<typeof userApi.editPass>){
    await this.dao.editPass(ctx.state.user.password,ctx.state.p.oldpass,ctx.state.p.newpass,ctx.state.user)

    }

@api(userApi.reset,keys<typeof userApi.reset.param>())
async reset (ctx:IKoa_ctx<typeof userApi.reset>){
    await this.dao.reset(ctx.state.p.name,ctx.state.p.answer,ctx.state.p.password)

    }

@api(userApi.question,keys<typeof userApi.question.param>())
async question (ctx:IKoa_ctx<typeof userApi.question>){
    let obj=await this.dao.question(ctx.state.p.name)
    return obj
    }

    @user
@api(userApi.applyList,keys<typeof userApi.applyList.param>())
async applyList (ctx:IKoa_ctx<typeof userApi.applyList>){
    let obj=await this.dao.applyList(ctx.state.user._id.toString())
    return obj
    }

    @user
@api(userApi.handleApply,keys<typeof userApi.handleApply.param>())
async handleApply (ctx:IKoa_ctx<typeof userApi.handleApply>){
    let obj=await this.dao.handleApply(ctx.state.p.apply,ctx.state.p.state,ctx.state.user._id.toString())
    return obj
    }
    @user
@api(userApi.editSendInfo,keys<typeof userApi.editSendInfo.param>())
async setSendInfo (ctx:IKoa_ctx<typeof userApi.editSendInfo>){
    await this.dao.setSendInfo(ctx.state.p.user,ctx.state.p.password,ctx.state.p.smtp,ctx.state.user)

    }
    @user
@api(userApi.sendInfo,keys<typeof userApi.sendInfo.param>())
async getSendInfo (ctx:IKoa_ctx<typeof userApi.sendInfo>){
        let obj=await this.dao.getSendInfo(ctx.state.user)
        return obj

    }
@api(userApi.version,keys<typeof userApi.version.param>())
async version (ctx:IKoa_ctx<typeof userApi.version>){
    let obj=await this.dao.version()
    return obj

    }
}

export=new User;










