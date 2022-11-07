

import e=require("../../util/error.json");
import util=require("../../util/util");
import {api, user} from "../generateParams";
import templateApi = require("../../../Common/routes/template")
import {keys} from "../../../Common/transform";
import templateDao=require("../../dao/templateDao")
import {IKoa_ctx} from "../../types/global";
class Template {
    constructor(private dao=templateDao) {
    }
    @user
@api(templateApi.edit,keys<typeof templateApi.edit.param>())
async saveTemplate (ctx:IKoa_ctx<typeof templateApi.edit>){
    let obj=await this.dao.saveTemplate(ctx.state.p.id,ctx.state.p.name,ctx.state.p.project,ctx.state.p.method,ctx.state.p.param,ctx.state.p.url,ctx.state.p.remark,ctx.headers["docleverversion"])
    return obj
    }
    @user
@api(templateApi.item,keys<typeof templateApi.item.param>())
async templateInfo (ctx:IKoa_ctx<typeof templateApi.item>){
    let obj=await this.dao.templateInfo(ctx.state.p.id)
    return obj
    }
    @user
@api(templateApi.list,keys<typeof templateApi.list.param>())
async templateList (ctx:IKoa_ctx<typeof templateApi.list>){
    let obj=await this.dao.templateList(ctx.state.p.project,ctx.headers["docleverversion"])
    return obj
    }
    @user
@api(templateApi.remove,keys<typeof templateApi.remove.param>())
async removeTemplate (ctx:IKoa_ctx<typeof templateApi.remove>){
    await this.dao.removeTemplate(ctx.state.p.id)

    }
}


export=new Template;
