/**
 * Created by sunxin on 2016/11/16.
 */


import e=require("../../util/error.json");
import util=require("../../util/util");
import con=require("../../../config.json");
import {api, user} from "../generateParams";
import projectApi = require("../../../Common/routes/project")
import {keys} from "../../../Common/transform";
import projectDao=require("../../dao/projectDao")
import {IKoa_ctx} from "../../types/global";
class Project {
    constructor(private dao=projectDao) {
    }
    @user
@api(projectApi.create,keys<typeof projectApi.create.param>())
async create (ctx:IKoa_ctx<typeof projectApi.create>){
        let obj=await this.dao.create(ctx.state.p.id,ctx.state.p.name,ctx.state.p.dis,ctx.state.p.team,ctx.state.p.public,ctx.state.p.import,ctx.state.user._id.toString(),ctx)
        return obj
    }

    @user
@api(projectApi.editMemeber,keys<typeof projectApi.editMemeber.param>())
async addMember (ctx:IKoa_ctx<typeof projectApi.editMemeber>){
    let obj=await this.dao.addMember(ctx.state.p.id,ctx.state.p.user,ctx.state.p.role,ctx.state.p.option,ctx.state.user._id.toString(),ctx)
        return obj

    }

    @user
@api(projectApi.editRole,keys<typeof projectApi.editRole.param>())
async role (ctx:IKoa_ctx<typeof projectApi.editRole>){
        await this.dao.role(ctx.state.p.id,ctx.state.p.user,ctx.state.p.role,ctx.state.p.option,ctx.state.user._id.toString(),ctx)

    }

    @user
@api(projectApi.removeMember,keys<typeof projectApi.removeMember.param>())
async removeMember (ctx:IKoa_ctx<typeof projectApi.removeMember>){
        await this.dao.removeMember(ctx.state.p.id,ctx.state.p.user,ctx.state.user._id.toString(),ctx)

    }

    @user
@api(projectApi.list,keys<typeof projectApi.list.param>())
async list (ctx:IKoa_ctx<typeof projectApi.list>){
    let obj=await this.dao.list(ctx.state.user._id.toString())
        return obj

    }
    @user
@api(projectApi.filterList,keys<typeof projectApi.filterList.param>())
async filterList (ctx:IKoa_ctx<typeof projectApi.filterList>){
    let obj=await this.dao.filterList(ctx.state.p.name,ctx.state.p.team,ctx.state.user._id.toString())
    return obj
    }
    @user
@api(projectApi.editUrl,keys<typeof projectApi.editUrl.param>())
async url (ctx:IKoa_ctx<typeof projectApi.editUrl>){
    let obj=await this.dao.url(ctx.state.p.id,ctx.state.p.urls,ctx.state.user._id.toString(),ctx)
        return obj

    }

    @user
@api(projectApi.info,keys<typeof projectApi.info.param>())
async info (ctx:IKoa_ctx<typeof projectApi.info>){
    let obj=await this.dao.info(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
        return  obj

    }

    @user
@api(projectApi.group,keys<typeof projectApi.group.param>())
async groupList (ctx:IKoa_ctx<typeof projectApi.group>){
    let obj=await this.dao.groupList(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
    return obj
    }

    @user
@api(projectApi.interface,keys<typeof projectApi.interface.param>())
async interfaceList (ctx:IKoa_ctx<typeof projectApi.interface>){
    let obj=await this.dao.interfaceList(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
        return obj

    }

    @user
@api(projectApi.clear,keys<typeof projectApi.clear.param>())
async clear (ctx:IKoa_ctx<typeof projectApi.clear>){
    let obj=await this.dao.clear(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
    return obj
    }

    @user
@api(projectApi.remove,keys<typeof projectApi.remove.param>())
async removeProject (ctx:IKoa_ctx<typeof projectApi.remove>){
    await this.dao.removeProject(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
    }

    @user
@api(projectApi.quit,keys<typeof projectApi.quit.param>())
async quit (ctx:IKoa_ctx<typeof projectApi.quit>){
    await this.dao.quit(ctx.state.p.id,ctx.state.user._id.toString(),ctx)

    }

    @user
@api(projectApi.addUrl,keys<typeof projectApi.addUrl.param>())
async addUrl (ctx:IKoa_ctx<typeof projectApi.addUrl>){
    await this.dao.addUrl(ctx.state.p.id,ctx.state.p.url,ctx.state.user._id.toString(),ctx)

    }

    @user
@api(projectApi.exportJSON,keys<typeof projectApi.exportJSON.param>())
async exportJSON (ctx:IKoa_ctx<typeof projectApi.exportJSON>){
    let {headers,content}=await this.dao.exportJSON(ctx.state.p.id,ctx.state.p.version,ctx.state.user._id.toString(),ctx)
        ctx.set(headers)
        return content
    }

    @user
@api(projectApi.importJSON,keys<typeof projectApi.importJSON.param>())
async importJSON (ctx:IKoa_ctx<typeof projectApi.importJSON>){
    let obj=await this.dao.importJSON(ctx.state.p.json,ctx.state.p.team,ctx.state.user._id.toString())
    return obj
    }

    @user
@api(projectApi.inject,keys<typeof projectApi.inject.param>())
async setInject (ctx:IKoa_ctx<typeof projectApi.inject>){
    await this.dao.setInject(ctx.state.p.id,ctx.state.p.before,ctx.state.p.after,ctx.state.user._id.toString(),ctx)
    }

    @user
@api(projectApi.urlList,keys<typeof projectApi.urlList.param>())
async urlList (ctx:IKoa_ctx<typeof projectApi.urlList>){
    let obj=await this.dao.urlList(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
    return obj
    }

    @user
@api(projectApi.importMemberInfo,keys<typeof projectApi.importMemberInfo.param>())
async getImportMember (ctx:IKoa_ctx<typeof projectApi.importMemberInfo>){
    let obj=await this.dao.getImportMember(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
        return obj
    }

    @user
@api(projectApi.editImportMemeber,keys<typeof projectApi.editImportMemeber.param>())
async importMember (ctx:IKoa_ctx<typeof projectApi.editImportMemeber>){
    await this.dao.importMember(ctx.state.p.id,ctx.state.p.data,ctx.state.user._id.toString(),ctx)
    }

    @user
@api(projectApi.exportHTML,keys<typeof projectApi.exportHTML.param>())
async exportHTML (ctx:IKoa_ctx<typeof projectApi.exportHTML>){
    await this.dao.exportHTML(ctx.state.p.id,ctx.state.p.version,ctx.state.user._id.toString(),ctx.state.user.name,ctx)

    }

    @user
@api(projectApi.editOwner,keys<typeof projectApi.editOwner.param>())
async setOwner (ctx:IKoa_ctx<typeof projectApi.editOwner>){
    await this.dao.setOwner(ctx.state.p.id,ctx.state.p.user,ctx.state.user._id.toString(),ctx)
    }

    @user
@api(projectApi.applyList,keys<typeof projectApi.applyList.param>())
async applyList (ctx:IKoa_ctx<typeof projectApi.applyList>){
    let obj=await this.dao.applyList(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
    return obj
    }

    @user
@api(projectApi.handleApply,keys<typeof projectApi.handleApply.param>())
async handleApply (ctx:IKoa_ctx<typeof projectApi.handleApply>){
        await this.dao.handleApply(ctx.state.p.id,ctx.state.p.apply,ctx.state.p.state,ctx.state.user._id.toString(),ctx)
    }

    @user
@api(projectApi.editUser,keys<typeof projectApi.editUser.param>())
async setUser (ctx:IKoa_ctx<typeof projectApi.editUser>){
    await this.dao.setUser(ctx.state.p.id,ctx.state.p.user,ctx.state.user._id.toString(),ctx)

    }

    @user
@api(projectApi.users,keys<typeof projectApi.users.param>())
async getUsers (ctx:IKoa_ctx<typeof projectApi.users>){
    let arr=await this.dao.getUsers(ctx.state.p.id,ctx.state.user._id.toString(),ctx)
    return arr
    }

    @user
@api(projectApi.importRap,keys<typeof projectApi.importRap.param>())
async importRap (ctx:IKoa_ctx<typeof projectApi.importRap>){
    let obj=await this.dao.importRap(ctx.state.p.json,ctx.state.p.team,ctx.state.p.bodytype,ctx.state.user._id.toString())
    return obj
    }

    @user
@api(projectApi.importSwagger,keys<typeof projectApi.importSwagger.param>())
async importSwagger (ctx:IKoa_ctx<typeof projectApi.importSwagger>){

        let obj=await this.dao.importSwagger(ctx.state.p.json,ctx.state.p.url,ctx.state.p.team,ctx.state.user._id.toString())
        return obj
    }
    @user
@api(projectApi.updateSwagger,keys<typeof projectApi.updateSwagger.param>())
async updateSwagger (ctx:IKoa_ctx<typeof projectApi.updateSwagger>){
        let obj=await this.dao.updateSwagger(ctx.state.p.id,ctx.state.p.json,ctx.state.p.url,ctx.state.user._id.toString(),ctx)
        return obj
    }
    @user
@api(projectApi.importPostman,keys<typeof projectApi.importPostman.param>())
async importPostman (ctx:IKoa_ctx<typeof projectApi.importPostman>){
    let obj=await this.dao.importPostman(ctx.state.p.json,ctx.state.p.baseurl,ctx.state.p.ignore,ctx.state.user._id.toString(),ctx)
    return obj
    }
    @user
@api(projectApi.exportDoc,keys<typeof projectApi.exportDoc.param>())
async exportDocx (ctx:IKoa_ctx<typeof projectApi.exportDoc>){
    await this.dao.exportDocx(ctx.state.p.id,ctx.state.p.version,ctx.state.user._id.toString(),ctx)

    }
}

export=new Project
