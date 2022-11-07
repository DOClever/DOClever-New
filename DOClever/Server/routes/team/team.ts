/**
 * Created by sunxin on 2017/6/7.
 */


import e=require("../../util/error.json");
import util=require("../../util/util");
import moment=require("moment");
import {UserModel} from "../../model/types";
import {api, user} from "../generateParams";
import teamApi = require("../../../Common/routes/team")
import {keys} from "../../../Common/transform";
import {IKoa_ctx} from "../../types/global";
import teamDao=require("../../dao/teamDao")
class Team {
constructor(private dao=teamDao) {
}
@user
@api(teamApi.save,keys<typeof teamApi.save.param>())
async save (ctx:IKoa_ctx<typeof teamApi.save>){
    let obj=await this.dao.save(ctx.state.p.id,ctx.state.p.name,ctx.state.p.dis,ctx.state.user._id.toString())
    return obj
    }


@user
@api(teamApi.info,keys<typeof teamApi.info.param>())
async info (ctx:IKoa_ctx<typeof teamApi.info>){
    let obj=await this.dao.info(ctx.state.p.id,ctx.state.user._id.toString())
    return obj
    }


@user
@api(teamApi.pullUser,keys<typeof teamApi.pullUser.param>())
async pullUser (ctx:IKoa_ctx<typeof teamApi.pullUser>){
await this.dao.pullUser(ctx.state.p.id,ctx.state.p.user,ctx.state.p.group,ctx.state.user._id.toString())

    }


@user
@api(teamApi.removeUser,keys<typeof teamApi.removeUser.param>())
async removeUser (ctx:IKoa_ctx<typeof teamApi.removeUser>){
await this.dao.removeUser(ctx.state.p.id,ctx.state.p.self,ctx.state.p.user,ctx.state.user._id.toString())

    }


@user
@api(teamApi.removeProjectUser,keys<typeof teamApi.removeProjectUser.param>())
async removeProjectUser (ctx:IKoa_ctx<typeof teamApi.removeProjectUser>){
let obj=await this.dao.removeProjectUser(ctx.state.p.id,ctx.state.p.user,ctx.state.user._id.toString())
    return obj

    }


@user
@api(teamApi.projectUser,keys<typeof teamApi.projectUser.param>())
async projectUser (ctx:IKoa_ctx<typeof teamApi.projectUser>){
let obj=await this.dao.projectUser(ctx.state.p.id,ctx.state.p.project,ctx.state.user._id.toString())
    return obj
    }


@user
@api(teamApi.editUserRole,keys<typeof teamApi.editUserRole.param>())
async userRole (ctx:IKoa_ctx<typeof teamApi.editUserRole>){
    await this.dao.userRole(ctx.state.p.id,ctx.state.p.user,ctx.state.user._id.toString())
    }


@user
@api(teamApi.moveUser,keys<typeof teamApi.moveUser.param>())
async moveUser (ctx:IKoa_ctx<typeof teamApi.moveUser>){
    let obj=await this.dao.moveUser(ctx.state.p.id,ctx.state.p.user,ctx.state.p.group,ctx.state.user._id.toString())
    return obj

    }


@user
@api(teamApi.editGroup,keys<typeof teamApi.editGroup.param>())
async createGroup (ctx:IKoa_ctx<typeof teamApi.editGroup>){
    let obj=await this.dao.createGroup(ctx.state.p.id,ctx.state.p.name,ctx.state.p.group,ctx.state.user._id.toString())
    return obj

    }


@user
@api(teamApi.removeGroup,keys<typeof teamApi.removeGroup.param>())
async removeGroup (ctx:IKoa_ctx<typeof teamApi.removeGroup>){
    await this.dao.removeGroup(ctx.state.p.id,ctx.state.p.group,ctx.state.user._id.toString())

    }


@user
@api(teamApi.pullProject,keys<typeof teamApi.pullProject.param>())
async pullProject (ctx:IKoa_ctx<typeof teamApi.pullProject>){
    await this.dao.pullProject(ctx.state.p.id,ctx.state.p.project,ctx.state.user._id.toString())

    }


@user
@api(teamApi.userApply,keys<typeof teamApi.userApply.param>())
async userApply (ctx:IKoa_ctx<typeof teamApi.userApply>){
    await this.dao.userApply(ctx.state.p.id,ctx.state.p.dis,ctx.state.user._id.toString())

    }


@user
@api(teamApi.projectApply,keys<typeof teamApi.projectApply.param>())
async projectApply (ctx:IKoa_ctx<typeof teamApi.projectApply>){
    await this.dao.projectApply(ctx.state.p.id,ctx.state.p.project,ctx.state.p.dis,ctx.state.user._id.toString())

    }


@user
@api(teamApi.group,keys<typeof teamApi.group.param>())
async groupList (ctx:IKoa_ctx<typeof teamApi.group>){
    let obj=await this.dao.groupList(ctx.state.p.id,ctx.state.user._id.toString())
    return obj
    }


@user
@api(teamApi.editNotice,keys<typeof teamApi.editNotice.param>())
async saveNotice (ctx:IKoa_ctx<typeof teamApi.editNotice>){
    let obj=await this.dao.saveNotice(ctx.state.p.id,ctx.state.p.notice,ctx.state.p.content,ctx.state.user._id.toString())
    return obj

    }


@user
@api(teamApi.notice,keys<typeof teamApi.notice.param>())
async getNotice (ctx:IKoa_ctx<typeof teamApi.notice>){
    let obj=await this.dao.getNotice(ctx.state.p.id,ctx.state.p.page,ctx.state.user._id.toString())
    return obj
    }


@user
@api(teamApi.removeNotice,keys<typeof teamApi.removeNotice.param>())
async removeNotice (ctx:IKoa_ctx<typeof teamApi.removeNotice>){
    await this.dao.removeNotice(ctx.state.p.id,ctx.state.p.notice,ctx.state.user._id.toString())

    }



@user
@api(teamApi.applyInfo,keys<typeof teamApi.applyInfo.param>())
async applyList (ctx:IKoa_ctx<typeof teamApi.applyInfo>){
    let obj=await this.dao.applyList(ctx.state.p.id,ctx.state.user._id.toString())
    return obj
    }

@user
@api(teamApi.editApply,keys<typeof teamApi.editApply.param>())
async handleApply (ctx:IKoa_ctx<typeof teamApi.editApply>){
    let obj=await this.dao.handleApply(ctx.state.p.id,ctx.state.p.apply,ctx.state.p.state,ctx.state.p.group,ctx.state.p.role,ctx.state.user._id.toString(),ctx.state.user.name)
    return obj
    }


@user
@api(teamApi.removeProject,keys<typeof teamApi.removeProject.param>())
async removeProject (ctx:IKoa_ctx<typeof teamApi.removeProject>){
    await this.dao.removeProject(ctx.state.p.id,ctx.state.p.project,ctx.state.user._id.toString())

    }


@user
@api(teamApi.userPulledList,keys<typeof teamApi.userPulledList.param>())
async userPulledList (ctx:IKoa_ctx<typeof teamApi.userPulledList>){
    let obj=await this.dao.userPulledList(ctx.state.p.id,ctx.state.p.project,ctx.state.user._id.toString())
    return obj
    }


@user
@api(teamApi.userJoin,keys<typeof teamApi.userJoin.param>())
async userJoin (ctx:IKoa_ctx<typeof teamApi.userJoin>){
    let obj=await this.dao.userJoin(ctx.state.p.id,ctx.state.p.group,ctx.state.p.user,ctx.state.p.role,ctx.state.user._id.toString())
    return obj
    }


@user
@api(teamApi.remove,keys<typeof teamApi.remove.param>())
async removeTeam (ctx:IKoa_ctx<typeof teamApi.remove>){
    await this.dao.removeTeam(ctx.state.p.id,ctx.state.user._id.toString())
    }

@user
@api(teamApi.transfer,keys<typeof teamApi.transfer.param>())
async transfer (ctx:IKoa_ctx<typeof teamApi.transfer>){
    await this.dao.transfer(ctx.state.p.id,ctx.state.p.user,ctx.state.user._id.toString())

    }

@user
@api(teamApi.user,keys<typeof teamApi.user.param>())
async userList (ctx:IKoa_ctx<typeof teamApi.user>){
let obj=await this.dao.userList(ctx.state.p.id,ctx.state.user._id.toString())
    return obj

    }

@user
@api(teamApi.list,keys<typeof teamApi.list.param>())
async list (ctx:IKoa_ctx<typeof teamApi.list>){
    let obj=await this.dao.list(ctx.state.user._id.toString())
    return obj

    };

@user
@api(teamApi.projectList,keys<typeof teamApi.projectList.param>())
async projectList (ctx:IKoa_ctx<typeof teamApi.projectList>){
    let obj=await this.dao.projectList(ctx.state.p.id,ctx.state.user._id.toString())
    return obj

    }

@user
@api(teamApi.docList,keys<typeof teamApi.docList.param>())
async docList (ctx:IKoa_ctx<typeof teamApi.docList>){
    let obj=await this.dao.docList(ctx.state.p.id,ctx.state.user._id.toString())
    return obj;
    }

@user
@api(teamApi.testList,keys<typeof teamApi.testList.param>())
async testList (ctx:IKoa_ctx<typeof teamApi.testList>){
    let obj=await this.dao.testList(ctx.state.p.id,ctx.state.user._id.toString())
    return obj
    }

@user
@api(teamApi.removeDoc,keys<typeof teamApi.removeDoc.param>())
async removeDoc (ctx:IKoa_ctx<typeof teamApi.removeDoc>){
    let obj=await this.dao.removeDoc(ctx.state.p.id,ctx.state.p.project,ctx.state.user._id.toString())
    return obj
    }

@user
@api(teamApi.docUser,keys<typeof teamApi.docUser.param>())
async docUser (ctx:IKoa_ctx<typeof teamApi.docUser>){
    let obj=await this.dao.docUser(ctx.state.p.id,ctx.state.p.project,ctx.state.user._id.toString())
    return obj
    }

@user
@api(teamApi.pullDoc,keys<typeof teamApi.pullDoc.param>())
async pullDoc (ctx:IKoa_ctx<typeof teamApi.pullDoc>){
   await this.dao.pullDoc(ctx.state.p.id,ctx.state.p.project,ctx.state.user._id.toString())
    }

@user
@api(teamApi.docApply,keys<typeof teamApi.docApply.param>())
async docApply (ctx:IKoa_ctx<typeof teamApi.docApply>){
    await this.dao.docApply(ctx.state.p.id,ctx.state.p.project,ctx.state.p.dis,ctx.state.user._id.toString())

    }

@user
@api(teamApi.removeTest,keys<typeof teamApi.removeTest.param>())
async removeTest (ctx:IKoa_ctx<typeof teamApi.removeTest>){
    await this.dao.removeTest(ctx.state.p.id,ctx.state.p.project,ctx.state.user._id.toString())

    }

@user
@api(teamApi.testUser,keys<typeof teamApi.testUser.param>())
async testUser (ctx:IKoa_ctx<typeof teamApi.testUser>){
    let obj=await this.dao.testUser(ctx.state.p.id,ctx.state.p.project,ctx.state.user._id.toString())
    return obj
    }

@user
@api(teamApi.pullTest,keys<typeof teamApi.pullTest.param>())
async pullTest (ctx:IKoa_ctx<typeof teamApi.pullTest>){
    await this.dao.pullTest(ctx.state.p.id,ctx.state.p.project,ctx.state.user._id.toString())

    }

@user
@api(teamApi.testApply,keys<typeof teamApi.testApply.param>())
async testApply (ctx:IKoa_ctx<typeof teamApi.testApply>){
    await this.dao.testApply(ctx.state.p.id,ctx.state.p.project,ctx.state.p.dis,ctx.state.user._id.toString())

    }
}


export=new Team;


