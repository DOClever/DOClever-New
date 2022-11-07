import e=require("../../util/error.json");
import util=require("../../util/util");
import fs=require("fs-extra");
import path=require("path");
import mongoose = require('mongoose')
import adminCommon=require("../../dao/adminDao")
import construct = Reflect.construct;
import {admin, api} from "../generateParams";
import adminApi=require("../../../Common/routes/admin");
import {keys} from "../../../Common/transform";
import {IKoa_ctx} from "../../types/global";

var objectId=mongoose.Types.ObjectId;
class Admin
{
    constructor(private admin=adminCommon) {

    }
    @api(adminApi.login,keys<typeof adminApi.login.param>())
    async login (ctx:IKoa_ctx<typeof adminApi.login>){
        let obj=await this.admin.handleLogin(ctx.state.p.name,ctx.state.p.password)
        if(obj)
        {
            ctx.session.admin=obj._id;
        }
        else
        {
            throw e.adminNotFound
        }
    }
    @api(adminApi.logout,keys<typeof adminApi.logout.param>())
    async logout (ctx:IKoa_ctx<typeof adminApi.logout>){
        ctx.session.admin=null;
        delete ctx.session.admin;
    }
    @admin
    @api(adminApi.userStatistics,keys<typeof adminApi.userStatistics.param>())
    async userStatistics (ctx:IKoa_ctx<typeof adminApi.userStatistics>){
        let obj=await this.admin.userStatistics();
        return obj
    }
    @admin
    @api(adminApi.userList,keys<typeof adminApi.userList.param>())
    async userList (ctx:IKoa_ctx<typeof adminApi.userList>){
        let arr=await this.admin.userList(ctx.state.p.type,ctx.state.p.key,ctx.state.p.page)
        return arr
    }
    @admin
    @api(adminApi.userInfo,keys<typeof adminApi.userInfo.param>())
    async userInfo (ctx:IKoa_ctx<typeof adminApi.userInfo>){
        let obj=await this.admin.getUserInfo(ctx.state.p.id)
        if(!obj)
        {
            throw e.userNotFound;
        }
        else
        {
            return obj
        }
    }
    @admin
    @api(adminApi.editUser,keys<typeof adminApi.editUser.param>())
    async userCreate (ctx:IKoa_ctx<typeof adminApi.editUser>){
        let obj=await this.admin.userCreate(ctx.state.p,ctx.state.p.id,ctx.state.p.photo);
        return obj
    }
    @admin
    @api(adminApi.removeUser,keys<typeof adminApi.removeUser.param>())
    async userRemove (ctx:IKoa_ctx<typeof adminApi.removeUser>){
        await this.admin.userRemove(ctx.state.p.id);
    }
    @admin
    @api(adminApi.projectStatistics,keys<typeof adminApi.projectStatistics.param>())
    async projectStatistics (ctx:IKoa_ctx<typeof adminApi.projectStatistics>){
        let obj=await this.admin.projectStatistics();
        return obj
    }
    @admin
    @api(adminApi.projectList,keys<typeof adminApi.projectList.param>())
    async projectList (ctx:IKoa_ctx<typeof adminApi.projectList>){
        let arr=await this.admin.projectList(ctx.state.p.type,ctx.state.p.key,ctx.state.p.page,ctx.state.p.category)
        return arr
    }
    @admin
    @api(adminApi.getProject,keys<typeof adminApi.getProject.param>())
    async projectInfo (ctx:IKoa_ctx<typeof adminApi.getProject>){
        let obj=await this.admin.projectInfo(ctx.state.p.id,ctx.state.p.category);
        return obj
    }
    @admin
    @api(adminApi.editProject,keys<typeof adminApi.editProject.param>())
    async projectEdit (ctx:IKoa_ctx<typeof adminApi.editProject>){
        let obj=await this.admin.projectEdit(ctx.state.p.id,ctx.state.p.name,ctx.state.p.dis,ctx.state.p.public,ctx.state.p.category);
        return obj
    }
    @admin
    @api(adminApi.removeProject,keys<typeof adminApi.removeProject.param>())
    async projectRemove (ctx:IKoa_ctx<typeof adminApi.removeProject>){
        await this.admin.projectRemove(ctx.state.p.id,ctx.state.p.category);
    }
    @admin
    @api(adminApi.teamStatistics,keys<typeof adminApi.teamStatistics.param>())
    async teamStatistics (ctx:IKoa_ctx<typeof adminApi.teamStatistics>){
        let obj=await this.admin.teamStatistics();
        return obj
    }
    @admin
    @api(adminApi.teamList,keys<typeof adminApi.teamList.param>())
    async teamList (ctx:IKoa_ctx<typeof adminApi.teamList>){
        let arr=await this.admin.teamList(ctx.state.p.type,ctx.state.p.key,ctx.state.p.page);
        return arr
    }
    @admin
    @api(adminApi.teamInfo,keys<typeof adminApi.teamInfo.param>())
    async teamInfo (ctx:IKoa_ctx<typeof adminApi.teamInfo>){
        let obj=await this.admin.teamInfo(ctx.state.p.id);
        return obj
    }
    @admin
    @api(adminApi.removeTeam,keys<typeof adminApi.removeTeam.param>())
    async teamRemove (ctx:IKoa_ctx<typeof adminApi.removeTeam>){
        await this.admin.teamRemove(ctx.state.p.id);
    }
    @admin
    @api(adminApi.interfaceStatistics,keys<typeof adminApi.interfaceStatistics.param>())
    async interfaceStatistics (ctx:IKoa_ctx<typeof adminApi.interfaceStatistics>){
        let obj=await this.admin.interfaceStatistics();
        return obj
    }
    @admin
    @api(adminApi.editPassword,keys<typeof adminApi.editPassword.param>())
    async editPassword (ctx:IKoa_ctx<typeof adminApi.editPassword>){
        await this.admin.editPassword(ctx.state.p.old,ctx.state.admin)
    }
    @admin
    @api(adminApi.userProjectList,keys<typeof adminApi.userProjectList.param>())
    async userProjectList (ctx:IKoa_ctx<typeof adminApi.userProjectList>){
        let ret=await this.admin.userProjectList(ctx.state.p.id);
        return ret
    }
    @admin
    @api(adminApi.userTeamList,keys<typeof adminApi.userTeamList.param>())
    async userTeamList (ctx:IKoa_ctx<typeof adminApi.userTeamList>){
        let ret=await this.admin.userTeamList(ctx.state.p.id);
        return ret
    }
    @admin
    @api(adminApi.removeUserProject,keys<typeof adminApi.removeUserProject.param>())
    async userRemoveProject (ctx:IKoa_ctx<typeof adminApi.removeUserProject>){
        await this.admin.userRemoveProject(ctx.state.p.id);
    }
    @admin
    @api(adminApi.removeUserTeam,keys<typeof adminApi.removeUserTeam.param>())
    async userRemoveTeam (ctx:IKoa_ctx<typeof adminApi.removeUserTeam>){
        await this.admin.userRemoveTeam(ctx.state.p.id);
    }
    @admin
    @api(adminApi.editUserProjectOwn,keys<typeof adminApi.editUserProjectOwn.param>())
    async userTransferProject (ctx:IKoa_ctx<typeof adminApi.editUserProjectOwn>){
        await this.admin.userTransferProject(ctx.state.p.id,ctx.state.p.user,ctx.state.p.category);
    }
    @admin
    @api(adminApi.editUserTeamOwn,keys<typeof adminApi.editUserTeamOwn.param>())
    async userTransferTeam (ctx:IKoa_ctx<typeof adminApi.editUserTeamOwn>){
        let u=await this.admin.userTransferTeam(ctx.state.p.id,ctx.state.p.user)
        return u
    }
    @admin
    @api(adminApi.userQuitProject,keys<typeof adminApi.userQuitProject.param>())
    async userQuitProject (ctx:IKoa_ctx<typeof adminApi.userQuitProject>){
        await this.admin.userQuitProject(ctx.state.p.id,ctx.state.p.user);
    }
    @admin
    @api(adminApi.userQuitTeam,keys<typeof adminApi.userQuitTeam.param>())
    async userQuitTeam (ctx:IKoa_ctx<typeof adminApi.userQuitTeam>){
        await this.admin.userQuitTeam(ctx.state.p.id,ctx.state.p.user);
    }
    @admin
    @api(adminApi.addProject,keys<typeof adminApi.addProject.param>())
    async addProject (ctx:IKoa_ctx<typeof adminApi.addProject>){
        await this.admin.addProject(ctx.state.p.name,ctx.state.p.dis,ctx.state.p.owner,ctx.state.p.public,ctx.state.p.users,ctx.state.p.category)
    }
    @admin
    @api(adminApi.editProjectUser,keys<typeof adminApi.editProjectUser.param>())
    async setProjectUser (ctx:IKoa_ctx<typeof adminApi.editProjectUser>){
        await this.admin.setProjectUser(ctx.state.p.id,ctx.state.p.users,ctx.state.p.category);
    }
    @admin
    @api(adminApi.addTeam,keys<typeof adminApi.addTeam.param>())
    async addTeam (ctx:IKoa_ctx<typeof adminApi.addTeam>){
        await this.admin.addTeam(ctx.state.p.owner,ctx.state.p.name,ctx.state.p.dis,ctx.state.p.users)
    }
    @admin
    @api(adminApi.addTeamUser,keys<typeof adminApi.addTeamUser.param>())
    async addTeamUser (ctx:IKoa_ctx<typeof adminApi.addTeamUser>){
        let u=await this.admin.addTeamUser(ctx.state.p.id,ctx.state.p.user,ctx.state.p.group,ctx.state.p.role);
        return {
            user:u,
            role:1
        }
    }
    @admin
    @api(adminApi.removeTeamGroup,keys<typeof adminApi.removeTeamGroup.param>())
    async removeTeamGroup (ctx:IKoa_ctx<typeof adminApi.removeTeamGroup>){
        await this.admin.removeTeamGroup(ctx.state.p.group)
    }
    @admin
    @api(adminApi.removeTeamUser,keys<typeof adminApi.removeTeamUser.param>())
    async removeTeamUser (ctx:IKoa_ctx<typeof adminApi.removeTeamUser>){
        await this.admin.removeTeamUser(ctx.state.p.id,ctx.state.p.user);
    }
    @admin
    @api(adminApi.teamPullProject,keys<typeof adminApi.teamPullProject.param>())
    async pullTeamProject (ctx:IKoa_ctx<typeof adminApi.teamPullProject>){
        let objProject=await this.admin.pullTeamProject(ctx.state.p.id,ctx.state.p.project,ctx.state.p.category)
        return objProject
    }
    @admin
    @api(adminApi.teamPushProject,keys<typeof adminApi.teamPushProject.param>())
    async pushTeamProject (ctx:IKoa_ctx<typeof adminApi.teamPushProject>){
        await this.admin.pushTeamProject(ctx.state.p.id,ctx.state.p.project,ctx.state.p.category)
    }
    @admin
    @api(adminApi.editTeamUser,keys<typeof adminApi.editTeamUser.param>())
    async setTeamUserRole (ctx:IKoa_ctx<typeof adminApi.editTeamUser>){
        await this.admin.setTeamUserRole(ctx.state.p.id,ctx.state.p.user,ctx.state.p.role)
    }
    @admin
    @api(adminApi.projectUserRole,keys<typeof adminApi.projectUserRole.param>())
    async setProjectUserRole (ctx:IKoa_ctx<typeof adminApi.projectUserRole>){
        let ret=await this.admin.setProjectUserRole(ctx.state.p.id,ctx.state.p.user,ctx.state.p.role,ctx.state.p.option,ctx.state.p.category)
        return ret
    }
    @admin
    @api(adminApi.removeProjectUser,keys<typeof adminApi.removeProjectUser.param>())
    async removeProjectUser (ctx:IKoa_ctx<typeof adminApi.removeProjectUser>){
        await this.admin.removeProjectUser(ctx.state.p.id,ctx.state.p.user,ctx.state.p.category);
    }
    @admin
    @api(adminApi.searchUser,keys<typeof adminApi.searchUser.param>())
    async searchUser (ctx:IKoa_ctx<typeof adminApi.searchUser>){
        let arr=await this.admin.searchUser(ctx.state.p.user);
        return arr
    }
    @admin
    @api(adminApi.projectUserList,keys<typeof adminApi.projectUserList.param>())
    async projectUserList (ctx:IKoa_ctx<typeof adminApi.projectUserList>){
        let objProject=await this.admin.projectUserList(ctx.state.p.id,ctx.state.p.category);
        return objProject
    }
    @admin
    @api(adminApi.editTeam,keys<typeof adminApi.editTeam.param>())
    async editTeam (ctx:IKoa_ctx<typeof adminApi.editTeam>){
        let objTeam=await this.admin.editTeam(ctx.state.p.id,ctx.state.p.name,ctx.state.p.dis);
        return objTeam
    }
    @admin
    @api(adminApi.moveTeamUser,keys<typeof adminApi.moveTeamUser.param>())
    async moveTeamUser (ctx:IKoa_ctx<typeof adminApi.moveTeamUser>){
        let update=await this.admin.moveTeamUser(ctx.state.p.id,ctx.state.p.user,ctx.state.p.group);
        return update
    }
    @admin
    @api(adminApi.teamUserList,keys<typeof adminApi.teamUserList.param>())
    async getTeamUserList (ctx:IKoa_ctx<typeof adminApi.teamUserList>){
        let arr=await this.admin.getTeamUserList(ctx.state.p.id);
        return arr
    }
    @admin
    @api(adminApi.teamProjectList,keys<typeof adminApi.teamProjectList.param>())
    async teamProjectList (ctx:IKoa_ctx<typeof adminApi.teamProjectList>){
        let arr=await this.admin.teamProjectList(ctx.state.p.id);
        return arr
    }
    @admin
    @api(adminApi.statisticList,keys<typeof adminApi.statisticList.param>())
    async statisticList (ctx:IKoa_ctx<typeof adminApi.statisticList>){
        let arr=await this.admin.statisticList(ctx.state.p.start,ctx.state.p.end);
        return arr
    }
    @admin
    @api(adminApi.setting,keys<typeof adminApi.setting.param>())
    async getSetting (ctx:IKoa_ctx<typeof adminApi.setting>){
        let ret=await this.admin.getSetting();
        return ret
    }
    @admin
    @api(adminApi.editBasicInfo,keys<typeof adminApi.editBasicInfo.param>())
    async setBasicInfo (ctx:IKoa_ctx<typeof adminApi.editBasicInfo>){
        await this.admin.setBasicInfo(ctx.state.p.register);
    }
    @admin
    @api(adminApi.editConnectInfo,keys<typeof adminApi.editConnectInfo.param>())
    async setConnectInfo (ctx:IKoa_ctx<typeof adminApi.editConnectInfo>){
        let obj={
            db:ctx.state.p.db,
            filePath:ctx.state.p.file,
            port:ctx.state.p.port
        }
        await fs.writeFile(path.join(__dirname,"../../../config.json"),JSON.stringify(obj));
    }
    @admin
    @api(adminApi.backup,keys<typeof adminApi.backup.param>())
    async backup (ctx:IKoa_ctx<typeof adminApi.backup>){
        await this.admin.backup(ctx.state.p.dbpath,ctx.state.p.backpath,ctx.state.p.hours,ctx.state.p.host,ctx.state.p.name,ctx.state.p.user,ctx.state.p.pass,ctx.state.p.authdb,ctx.state.p.immediate)
    }
    @admin
    @api(adminApi.restore,keys<typeof adminApi.restore.param>())
    async restore (ctx:IKoa_ctx<typeof adminApi.restore>){
        await this.admin.restore(ctx.state.p.id);
    }
    @admin
    @api(adminApi.backupList,keys<typeof adminApi.backupList.param>())
    async backupList (ctx:IKoa_ctx<typeof adminApi.backupList>){
        let ret=await this.admin.backupList(ctx.state.p.page);
        return ret
    }
    @admin
    @api(adminApi.removeBackup,keys<typeof adminApi.removeBackup.param>())
    async removeBackup (ctx:IKoa_ctx<typeof adminApi.removeBackup>){
        await this.admin.removeBackup(ctx.state.p.id);
    }
}
export=new Admin;










