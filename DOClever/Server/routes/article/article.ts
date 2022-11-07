/**
 * Created by sunxin on 2017/7/7.
 */


import e=require("../../util/error.json");
import util=require("../../util/util");
import articleCommon=require("../../dao/articleDao");
import {api, user} from "../generateParams";
import articleApi=require("../../../Common/routes/article")
import {keys} from "../../../Common/transform";
import {IKoa_ctx} from "../../types/global";
class Article
{
    constructor(private article=articleCommon){

    }
    @user
    @api(articleApi.save,keys<typeof articleApi.save.param>())
    async save(ctx:IKoa_ctx<typeof articleApi.save>){
        let query = {
            title: ctx.state.p.title,
            content: ctx.state.p.content,
            project: ctx.state.p.project,
            creator: ctx.state.user._id
        }
        let obj=await this.article.save(ctx.state.p.id,query);
        return obj
    };
    @user
    @api(articleApi.remove,keys<typeof articleApi.remove.param>())
    async remove(ctx:IKoa_ctx<typeof articleApi.remove>){
        await this.article.remove(ctx.state.p.id);
    }
    @user
    @api(articleApi.info,keys<typeof articleApi.info.param>())
    async info(ctx:IKoa_ctx<typeof articleApi.info>){
        let obj =await this.article.info(ctx.state.p.id);
        if (!obj) {
            throw e.articleNotFound;
        }
        return obj
    }
    @user
    @api(articleApi.list,keys<typeof articleApi.list.param>())
    async list(ctx:IKoa_ctx<typeof articleApi.list>){
        let arr = await this.article.list(ctx.state.p.project,ctx.state.p.page);
        return arr
    }
}
export=new Article;









