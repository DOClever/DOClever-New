

import e=require("../../util/error.json");
import util=require("../../util/util");
import exampleDao=require("../../dao/exampleDao")
import {api, user} from "../generateParams";
import exampleApi = require("../../../Common/routes/example")
import {keys} from "../../../Common/transform";
import {IKoa_ctx} from "../../types/global";
class Example {
    constructor(private example=exampleDao) {
    }
    @user
@api(exampleApi.editItem,keys<typeof exampleApi.editItem.param>())
async saveExample (ctx:IKoa_ctx<typeof exampleApi.editItem>){
        let obj=await this.example.saveExample(ctx.state.p.name,ctx.state.p.project,ctx.state.p.interface,ctx.state.p.paramid,ctx.state.p.param,ctx.state.p.id,ctx.req.headers["docleverversion"] as string,ctx.state.user._id.toString())
        return obj
    }
    @user
@api(exampleApi.item,keys<typeof exampleApi.item.param>())
async exampleInfo (ctx:IKoa_ctx<typeof exampleApi.item>){
        let obj=await this.example.exampleInfo(ctx.state.p.id)
        return obj

    }
    @user
@api(exampleApi.list,keys<typeof exampleApi.list.param>())
async exampleList (ctx:IKoa_ctx<typeof exampleApi.list>){
        let obj=await this.example.exampleList(ctx.state.p.interface,ctx.state.p.paramid)
        return obj
    }
    @user
@api(exampleApi.removeItem,keys<typeof exampleApi.removeItem.param>())
async removeExample (ctx:IKoa_ctx<typeof exampleApi.removeItem>){
        await this.example.removeExample(ctx.state.p.id)

    }
    @user
@api(exampleApi.allList,keys<typeof exampleApi.allList.param>())
async exampleAllList (ctx:IKoa_ctx<typeof exampleApi.allList>){
        let obj=await this.example.exampleAllList(ctx.state.p.interface)
        return obj

    }
}


export=new Example;
