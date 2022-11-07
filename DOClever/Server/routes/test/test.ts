/**
 * Created by sunxin on 2017/4/25.
 */


import e=require("../../util/error.json");
import util=require("../../util/util");
import uuid=require("uuid");
import {api, user} from "../generateParams";
import testApi = require("../../../Common/routes/test")
import {keys} from "../../../Common/transform";
import testDao=require("../../dao/testDao")
import {IKoa_ctx} from "../../types/global";
class Test {
    constructor(private dao=testDao) {
    }
    @user
@api(testApi.editTest,keys<typeof testApi.editTest.param>())
async save (ctx:IKoa_ctx<typeof testApi.editTest>){
    let obj=await this.dao.save(ctx.state.p.id,ctx.state.p.user,ctx.state.p,ctx.state.p.group,ctx.state.user._id.toString())
    return obj
    }

    @user
@api(testApi.list,keys<typeof testApi.list.param>())
async list (ctx:IKoa_ctx<typeof testApi.list>){
    let obj=await this.dao.list(ctx.state.p.project,ctx.state.p.user,ctx.state.user._id.toString())
        return obj
    }

    @user
@api(testApi.info,keys<typeof testApi.info.param>())
async info (ctx:IKoa_ctx<typeof testApi.info>){
    let obj=await this.dao.info(ctx.state.p.project,ctx.state.p.only,ctx.state.p.user,ctx.state.user._id.toString())
        return obj
    }

    @user
@api(testApi.editModule,keys<typeof testApi.editModule.param>())
async saveModule (ctx:IKoa_ctx<typeof testApi.editModule>){
    let obj=await this.dao.saveModule(ctx.state.p.module,ctx.state.p.name,ctx.state.p.project,ctx.state.p.user)
        return obj

    }
    @user
@api(testApi.editGroup,keys<typeof testApi.editGroup.param>())
async saveGroup (ctx:IKoa_ctx<typeof testApi.editGroup>){
    let obj=await this.dao.saveGroup(ctx.state.p.group,ctx.state.p.name,ctx.state.p.module,ctx.state.p.user,ctx.state.p.project)
    return obj
    }

    @user
@api(testApi.removeModule,keys<typeof testApi.removeModule.param>())
async removeModule (ctx:IKoa_ctx<typeof testApi.removeModule>){
    await this.dao.removeModule(ctx.state.p.module)

    }

    @user
@api(testApi.removeGroup,keys<typeof testApi.removeGroup.param>())
async removeGroup (ctx:IKoa_ctx<typeof testApi.removeGroup>){
    await this.dao.removeGroup(ctx.state.p.group)

    }

    @user
@api(testApi.removeTest,keys<typeof testApi.removeTest.param>())
async removeTest (ctx:IKoa_ctx<typeof testApi.removeTest>){
    await this.dao.removeTest(ctx.state.p.id)

    }

    @user
@api(testApi.test,keys<typeof testApi.test.param>())
async testInfo (ctx:IKoa_ctx<typeof testApi.test>){
    let obj=await this.dao.testInfo(ctx.state.p.id,ctx.state.p.type)
    return obj
    }

    @user
@api(testApi.editStatus,keys<typeof testApi.editStatus.param>())
async setStatus (ctx:IKoa_ctx<typeof testApi.editStatus>){
    await this.dao.setStatus(ctx.state.p.id,ctx.state.p.status,ctx.state.p.output)

    }

    @user
@api(testApi.editOutput,keys<typeof testApi.editOutput.param>())
async setOutput (ctx:IKoa_ctx<typeof testApi.editOutput>){
    await this.dao.setOutput(ctx.state.p.id,ctx.state.p.output)
    }

    @user
@api(testApi.move,keys<typeof testApi.move.param>())
async moveTest (ctx:IKoa_ctx<typeof testApi.move>){
    await this.dao.moveTest(ctx.state.p.id,ctx.state.p.group)

    }
    @user
@api(testApi.projectList,keys<typeof testApi.projectList.param>())
async projectList (ctx:IKoa_ctx<typeof testApi.projectList>){
    let obj=await this.dao.projectList(ctx.state.user._id.toString())
    return obj
    }
    @user
@api(testApi.editProject,keys<typeof testApi.editProject.param>())
async saveProject (ctx:IKoa_ctx<typeof testApi.editProject>){
    let obj=await this.dao.saveProject(ctx.state.p.name,ctx.state.p.dis,ctx.state.p.team,ctx.state.p.project,ctx.state.user._id.toString())
        return obj
    }
    @user
@api(testApi.removeProject,keys<typeof testApi.removeProject.param>())
async removeProject (ctx:IKoa_ctx<typeof testApi.removeProject>){
    await this.dao.removeProject(ctx.state.p.project)

    }
    @user
@api(testApi.handleApply,keys<typeof testApi.handleApply.param>())
async handleApply (ctx:IKoa_ctx<typeof testApi.handleApply>){
    await this.dao.handleApply(ctx.state.p.apply,ctx.state.p.project,ctx.state.p.state,ctx.state.user._id.toString())
    }
    @user
@api(testApi.editOwner,keys<typeof testApi.editOwner.param>())
async setOwner (ctx:IKoa_ctx<typeof testApi.editOwner>){
    await this.dao.setOwner(ctx.state.p.project,ctx.state.p.user)

    }
    @user
@api(testApi.filterList,keys<typeof testApi.filterList.param>())
async filterList (ctx:IKoa_ctx<typeof testApi.filterList>){
    let obj=await this.dao.filterList(ctx.state.p.name,ctx.state.p.team,ctx.state.user._id.toString())
        return obj
    }
    @user
@api(testApi.editUser,keys<typeof testApi.editUser.param>())
async addUser (ctx:IKoa_ctx<typeof testApi.editUser>){
    let obj=await this.dao.addUser(ctx.state.p.project,ctx.state.p.user)
    return obj
    }
    @user
@api(testApi.removeUser,keys<typeof testApi.removeUser.param>())
async removeUser (ctx:IKoa_ctx<typeof testApi.removeUser>){
    await this.dao.removeUser(ctx.state.p.project,ctx.state.p.user)
    }
    @user
@api(testApi.quit,keys<typeof testApi.quit.param>())
async quit (ctx:IKoa_ctx<typeof testApi.quit>){
    await this.dao.quit(ctx.state.p.project,ctx.state.user._id.toString())

    }
    @user
@api(testApi.editUser,keys<typeof testApi.editUser.param>())
async setUser (ctx:IKoa_ctx<typeof testApi.editUser>){
    await this.dao.setUser(ctx.state.p.project,ctx.state.p.user)

    }
    @user
@api(testApi.interfaceList,keys<typeof testApi.interfaceList.param>())
async interfaceList (ctx:IKoa_ctx<typeof testApi.interfaceList>){
    let obj=await this.dao.interfaceList(ctx.state.user._id.toString())
    return obj
    }
    @user
@api(testApi.interface,keys<typeof testApi.interface.param>())
async interfaceInfo (ctx:IKoa_ctx<typeof testApi.interface>){
    let obj=await this.dao.interfaceInfo(ctx.state.p.interface,ctx.state.p.only)
    return obj
    }
    @user
@api(testApi.urlList,keys<typeof testApi.urlList.param>())
async urlList (ctx:IKoa_ctx<typeof testApi.urlList>){
    let obj=await this.dao.urlList(ctx.state.p.project,ctx.state.p.user,ctx.state.p.urls)
    return obj
    }
    @user
@api(testApi.interfaceProject,keys<typeof testApi.interfaceProject.param>())
async interfaceProject (ctx:IKoa_ctx<typeof testApi.interfaceProject>){
    let obj=await this.dao.interfaceProject(ctx.state.p.project,ctx.state.p.version)
        return obj
    }
    @user
@api(testApi.editCollection,keys<typeof testApi.editCollection.param>())
async saveCollection (ctx:IKoa_ctx<typeof testApi.editCollection>){
    let obj=await this.dao.saveCollection(ctx.state.p.collection,ctx.state.p.project,ctx.state.p.user,ctx.state.p.name,ctx.state.p.test,ctx.state.p.output)
    return obj
    }
    @user
@api(testApi.collectionList,keys<typeof testApi.collectionList.param>())
async collectionList (ctx:IKoa_ctx<typeof testApi.collectionList>){
    let obj=await this.dao.collectionList(ctx.state.p.project,ctx.state.p.user,ctx.state.user._id.toString())
    return obj
    }
    @user
@api(testApi.collection,keys<typeof testApi.collection.param>())
async collectionInfo (ctx:IKoa_ctx<typeof testApi.collection>){
    let obj=await this.dao.collectionInfo(ctx.state.p.collection)
        return obj
    }
    @user
@api(testApi.removeCollection,keys<typeof testApi.removeCollection.param>())
async removeCollection (ctx:IKoa_ctx<typeof testApi.removeCollection>){
    await this.dao.removeCollection(ctx.state.p.collection)

    }
    @user
@api(testApi.users,keys<typeof testApi.users.param>())
async getUsers (ctx:IKoa_ctx<typeof testApi.users>){
    let obj=await this.dao.getUsers(ctx.state.p.project)
    return obj
    }
    @user
@api(testApi.cooperation,keys<typeof testApi.cooperation.param>())
async cooperationInfo (ctx:IKoa_ctx<typeof testApi.cooperation>){
    let obj=await this.dao.cooperationInfo(ctx.state.p.project,ctx.state.user._id.toString())
    return obj
    }
    @user
@api(testApi.editCooperation,keys<typeof testApi.editCooperation.param>())
async editCooperation (ctx:IKoa_ctx<typeof testApi.editCooperation>){
    await this.dao.editCooperation(ctx.state.p.project,ctx.state.p.users,ctx.state.user._id.toString())
    }
    @user
@api(testApi.allGroupList,keys<typeof testApi.allGroupList.param>())
async getAllGroupList (ctx:IKoa_ctx<typeof testApi.allGroupList>){
    let obj=await this.dao.getAllGroupList(ctx.state.user._id.toString())
    return obj
    }
    @user
@api(testApi.allList,keys<typeof testApi.allList.param>())
async getAllList (ctx:IKoa_ctx<typeof testApi.allList>){
    let obj=await this.dao.getAllList(ctx.state.user._id.toString())
        return obj

    }
    @user
@api(testApi.exportProject,keys<typeof testApi.exportProject.param>())
async exportProject (ctx:IKoa_ctx<typeof testApi.exportProject>){
    let {headers,content}=await this.dao.exportProject(ctx.state.p.project,ctx.state.user._id.toString())
    ctx.set(headers)
        return content
    }
    @user
@api(testApi.importProject,keys<typeof testApi.importProject.param>())
async importProject (ctx:IKoa_ctx<typeof testApi.importProject>){
        let obj=await this.dao.importProject(ctx.state.p.content,ctx.state.p.project,ctx.state.user._id.toString())
        return obj
    }
    @user
@api(testApi.exportModule,keys<typeof testApi.exportModule.param>())
async exportModule (ctx:IKoa_ctx<typeof testApi.exportModule>){
    let {headers,content}=await this.dao.exportModule(ctx.state.p.module,ctx.state.user._id.toString())
    ctx.set(headers)
        return content
    }
    @user
@api(testApi.importModule,keys<typeof testApi.importModule.param>())
async importModule (ctx:IKoa_ctx<typeof testApi.importModule>){
    let obj=await this.dao.importModule(ctx.state.p.content,ctx.state.p.project,ctx.state.user._id.toString())
    return obj
    }
    @user
@api(testApi.exportGroup,keys<typeof testApi.exportGroup.param>())
async exportGroup (ctx:IKoa_ctx<typeof testApi.exportGroup>){
    let {headers,content}=await this.dao.exportGroup(ctx.state.p.group,ctx.state.user._id.toString())
    ctx.set(headers)
        return content
    }
    @user
@api(testApi.importGroup,keys<typeof testApi.importGroup.param>())
async importGroup (ctx:IKoa_ctx<typeof testApi.importGroup>){
    let obj=await this.dao.importGroup(ctx.state.p.content,ctx.state.p.module,ctx.state.user._id.toString())
        return obj
    }
    @user
@api(testApi.exportTest,keys<typeof testApi.exportTest.param>())
async exportTest (ctx:IKoa_ctx<typeof testApi.exportTest>){
    let {headers,content}=await this.dao.exportTest(ctx.state.p.test)
    ctx.set(headers)
        return content
    }
    @user
@api(testApi.importTest,keys<typeof testApi.importTest.param>())
async importTest (ctx:IKoa_ctx<typeof testApi.importTest>){
    let obj=await this.dao.importTest(ctx.state.p.content,ctx.state.p.group,ctx.state.user._id.toString())
    return obj;
    }
    @user
@api(testApi.pasteTest,keys<typeof testApi.pasteTest.param>())
async pasteTest (ctx:IKoa_ctx<typeof testApi.pasteTest>){
    let obj=await this.dao.pasteTest(ctx.state.p.test,ctx.state.p.group,ctx.state.user._id.toString())
        return obj
    }
}

export=new Test;



