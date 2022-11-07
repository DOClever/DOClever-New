/**
 * Created by sunxin on 2017/6/7.
 */


import e=require("../util/error.json");
import util=require("../util/util");
import userModel=require("../model/userModel")
import project=require("../model/projectModel")
import interfaceModel=require("../model/interfaceModel")
import team=require("../model/teamModel");
import apply=require("../model/applyModel");
import message=require("../model/messageModel");
import teamGroup=require("../model/teamGroupModel");
import docProject=require("../model/docProjectModel");
import doc=require("../model/docModel");
import testProject=require("../model/testProjectModel");
import test=require("../model/testModel");
import moment=require("moment");
import {
    DocProjectModel,
    GroupModel,
    ProjectModel,
    ProjectUsersModel, TeamGroupModel,
    TeamModel,
    TestProjectModel,
    UserModel
} from "../model/types";
import {api, user} from "../routes/generateParams";
import teamApi = require("../../Common/routes/team")
import {keys} from "../../Common/transform";
import {ITeamValidateUserRet} from "./types";
import {InstanceType} from "typegoose";
class TeamDao {
    async validateTeam (id:string){

        let obj=await team.findOne({
            _id:id,
        })
        if(!obj)
        {
            throw e.projectNotFound;
        }
        return obj

    }
    async validate (id:string,userId:string){
        let objModel=<ITeamValidateUserRet>{}
        let obj=await team.findOne({
            _id:id,
            owner:userId
        })
        if(!obj)
        {
            let arr=await teamGroup.find({
                team:id,
                "users.user":userId
            })
            if(arr.length==0)
            {
                throw e.projectNotFound;
                return;
            }
            else
            {
                objModel.arrTeamGroup=arr;
                obj=await team.findOne({
                    _id:arr[0].team
                })
            }
        }
        objModel.objTeam=obj;
        if(objModel.objTeam.owner.toString()==userId)
        {
            objModel.access=1;
        }
        else
        {
            objModel.access=0;
            for(let o of objModel.arrTeamGroup) {
                let bFind=false;
                for(let o1 of o.users)
                {
                    if (o1.user.toString() == userId && o1.role == 0) {
                        objModel.access = 1;
                        bFind=true;
                        break;
                    }
                }
                if(bFind)
                {
                    break;
                }
            }
        }
        return objModel;

    }

    async existUserInTeam (teamId:string,userId:string){
        let arrUser=await teamGroup.find({
            team:teamId
        })
        let bFind=false;
        for(let obj of arrUser) {
            for (let obj1 of obj.users) {
                if(obj1.user.toString()==userId.toString())
                {
                    bFind=true;
                    break;
                }
            }
            if(bFind)
            {
                break;
            }
        }
        if(bFind)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    async teamUserList (teamId:string){
        let arrUser=await teamGroup.find({
            team:teamId
        })
        let arr:string[]=[];
        arrUser.forEach(function (obj) {
            return obj.users.forEach(function (obj) {
                arr.push(obj.user.toString());
            })
        })
        return arr;
    }

    async save (id:string,name:string,dis:string,userId:string){
        let obj:InstanceType<TeamModel>;
        if(id)
        {
            let update:any={};
            if(name)
            {
                update.name=name;
            }
            if(dis)
            {
                update.dis=dis;
            }
            obj=await team.findOneAndUpdate({
                _id:id
            },update,{
                new:true
            })
        }
        else
        {
            obj=await team.create({
                name:name,
                dis:dis,
                owner:userId
            });
            obj._doc.userCount=1;
            obj._doc.projectCount=0;
            obj._doc.docCount=0;
            obj._doc.testCount=0;
            obj._doc.role=2;
            obj._doc.own=1;
            let objGroup=await teamGroup.create({
                name:"未命名",
                team:obj._id,
                users:[
                    {
                        user:userId,
                        role:2
                    }
                ]
            })
        }
        return obj

    }


    async info (id:string,userId:string){
        let objModel=await this.validate(id,userId)
        let obj:InstanceType<TeamModel>=await team.populate(objModel.objTeam,{
            path:"owner",
            select:"name photo"
        });
        let ret=[];
        if(objModel.access)
        {
            ret=await project.find({
                team:obj._id
            },"name dis users createdAt",{
                sort:"-createdAt"
            });
            ret.forEach(function (obj) {
                obj._doc.role=0;
                obj._doc.own=1;
            })
        }
        else
        {
            let arr=await project.find({
                owner:userId,
                team:obj._id
            },"name dis users createdAt",{
                sort:"-createdAt"
            });
            arr.forEach(function (obj) {
                obj._doc.role=0;
                obj._doc.own=1;
            })
            ret=ret.concat(arr);
            arr=await project.find({
                users:{
                    $elemMatch:{
                        user:userId,
                        role:0
                    }
                },
                team:obj._id
            },"name dis users createdAt",{
                sort:"-createdAt"
            })
            arr.forEach(function (obj) {
                obj._doc.own=0;
                obj._doc.role=0;
            })
            ret=ret.concat(arr);
            arr=await project.find({
                users:{
                    $elemMatch:{
                        user:userId,
                        role:1
                    }
                },
                team:obj._id
            },"name dis users createdAt",{
                sort:"-createdAt"
            })
            arr.forEach(function (obj) {
                obj._doc.own=0;
                obj._doc.role=1;
            })
            ret=ret.concat(arr);
        }
        ret.sort(function (obj1,obj2) {
            if(obj1.createdAt>obj2.createdAt)
            {
                return -1;
            }
            else if(obj1.createdAt<obj2.createdAt)
            {
                return 1;
            }
            else
            {
                return 0;
            }
        })
        let count=0;
        for(let obj of ret)
        {
            obj._doc.userCount=obj.users.length+1;
            delete obj._doc.users;
            obj._doc.interfaceCount=await interfaceModel.count({
                project:obj._id
            })
            count+=obj._doc.interfaceCount;
        }
        obj._doc.interfaceCount=count;
        obj._doc.project=ret;
        obj._doc.projectCount=await project.count({
            team:objModel.objTeam._id
        });
        let arr:(InstanceType<DocProjectModel>|InstanceType<TestProjectModel>|InstanceType<ProjectModel>)[];
        if(objModel.access)
        {
            arr=await docProject.find({
                team:objModel.objTeam._id
            },null,{
                sort:"-createdAt"
            });
            arr.forEach(function (obj) {
                obj._doc.own=1;
                obj._doc.role=0;
            })
        }
        else
        {
            arr=await docProject.find({
                $or:[
                    {
                        $or:[
                            {
                                owner:userId
                            },
                            {
                                users:userId
                            }
                        ],
                        publicTeam:0
                    },
                    {
                        publicTeam:1
                    }
                ],
                team:objModel.objTeam._id
            },null,{
                sort:"-createdAt"
            });
            arr.forEach(function (obj:InstanceType<DocProjectModel>) {
                if(userId==obj.owner.toString())
                {
                    obj._doc.own=1;
                    obj._doc.role=0;
                }
                else
                {
                    let arrUsers=obj.users.map(function (obj) {
                        return obj.toString();
                    })
                    if(arrUsers.indexOf(userId)>-1)
                    {
                        obj._doc.role=0;
                    }
                    else
                    {
                        obj._doc.role=1;
                    }
                }
            })
        }
        for(let o of arr)
        {
            o._doc.docCount=await doc.count({
                project:o._id
            })
            o._doc.userCount=o.users.length+1;
            delete o._doc.users;
        }
        obj._doc.doc=arr;
        obj._doc.docCount=await docProject.count({
            team:objModel.objTeam._id
        })
        if(objModel.access)
        {
            arr=await testProject.find({
                team:objModel.objTeam._id
            },null,{
                sort:"-createdAt"
            });
            arr.forEach(function (obj) {
                obj._doc.own=1;
                obj._doc.role=0;
            })
        }
        else
        {
            arr=await testProject.find({
                $or:[
                    {
                        owner:userId
                    },
                    {
                        users:userId
                    }
                ],
                team:userId
            },null,{
                sort:"-createdAt"
            });
            arr.forEach(function (obj) {
                if(userId==obj.owner.toString())
                {
                    obj._doc.own=1;
                    obj._doc.role=0;
                }
                else
                {
                    obj._doc.own=0;
                    obj._doc.role=0;
                }
            })
        }
        for(let o of arr)
        {
            o._doc.testCount=await test.count({
                project:o._id
            })
            o._doc.userCount=o.users.length+1;
            delete o._doc.users;
        }
        obj._doc.test=arr;
        obj._doc.testCount=await testProject.count({
            team:objModel.objTeam._id
        })
        ret=await teamGroup.find({
            team:objModel.objTeam._id
        },null,{
            sort:"name",
            populate:{
                path:"users.user",
                select:"name photo"
            }
        })
        count=0;
        ret.forEach(function (obj) {
            count+=obj.users.length;
            obj.users.sort(function (obj1,obj2) {
                return obj1.user.name>obj2.user.name
            })
        })
        obj._doc.userCount=count;
        obj._doc.user=ret;
        obj._doc.notice=obj._doc.notice.slice(0,10);
        if((obj.owner as UserModel)._id.toString()==userId)
        {
            obj._doc.role=2;
        }
        else
        {
            if(objModel.access)
            {
                obj._doc.role=0;
            }
            else
            {
                obj._doc.role=1;
            }
        }
        return obj

    }


    async pullUser (id:string,user:string,group:string,userId:string){
        let objModel=await this.validate(id,userId)
        if(objModel.access==0)
        {
            throw e.userForbidden;
        }
        let u=await userModel.findOne({
            name:user
        });
        if(!u)
        {
            throw e.userNotFound;
            return;
        }
        if((await this.existUserInTeam(objModel.objTeam._id,u._id)))
        {
            throw e.userAlreadyInTeam;
            return;
        }
        await apply.findOneAndUpdate({
            from:objModel.objTeam._id,
            to:u._id,
            type:0,
            state:0
        },{
            fromType:"TeamModel",
            from:objModel.objTeam._id,
            toType:"UserModel",
            to:u._id,
            type:0,
            state:0,
            creator:userId,
            relatedData:group
        },{
            upsert:true,
            setDefaultsOnInsert:true
        })

    }


    async removeUser (id:string,self:number,user:string,userId:string){
        let objModel=await this.validate(id,userId)
        if(objModel.access==0 && !self)
        {
            throw e.userForbidden;
            return;
        }
        let arr=await project.find({
            team:objModel.objTeam._id,
            $or:[
                {
                    owner:user
                },
                {
                    "users.user":user
                }
            ]
        })
        if(arr.length>0)
        {
            throw e.userInProject;
            return;
        }
        await teamGroup.update({
            team:objModel.objTeam._id
        },{
            "$pull":{
                "users":{
                    user:user
                }
            }
        },{
            multi:true
        });

    }


    async removeProjectUser (id:string,user:string,userId:string){
        let objModel=await this.validate(id,userId)
        await project.update({
            team:objModel.objTeam._id,
            "users.user":user
        },{
            $pull:{
                "users":{
                    user:user
                }
            }
        },{
            multi:true
        });
        let arr=await project.find({
            team:objModel.objTeam._id,
            owner:user
        });
        return arr

    }


    async projectUser (id:string,projectId:string,userId:string){
        let objModel=await this.validate(id,userId)
        let objPro=await project.findOne({
            _id:projectId
        })
        if(!objPro)
        {
            throw e.projectNotFound;
            return;
        }
        let arr=(objPro.users as ProjectUsersModel[]).map(function (obj) {
            let o:any={
                user:obj.user.toString(),
                role:obj.role
            }
            if(obj.option)
            {
                o.option=obj.option;
            }
            return o;
        });
        let arrUser=await teamGroup.find({
            team:objModel.objTeam._id
        },null,{
            populate:{
                path:"users.user",
                select:"name photo"
            }
        })
        for(let obj of arrUser)
        {
            for(let obj1 of obj.users)
            {
                if((obj1.user as UserModel)._id.toString()==objPro.owner.toString())
                {
                    (obj1.user as UserModel)._doc.select=1;
                    obj1.role=2;
                }
                else
                {
                    let index=util.inArrKey((obj1.user as UserModel)._id.toString(),arr,"user");
                    if(index>-1)
                    {
                        (<any>obj1)._doc.select=1;
                        obj1.role=arr[index].role;
                        if(arr[index].option)
                        {
                            (<any>obj1)._doc.option=arr[index].option
                        }
                    }
                    else
                    {
                        (<any>obj1)._doc.select=0;
                        obj1.role=1;
                    }
                }
            }
        }
        return arrUser

    }


    async userRole (id:string,user:string,userId:string){
        let objModel=await this.validate(id,userId)
        let arrUser=JSON.parse(user);
        for(let obj of arrUser)
        {
            await teamGroup.update({
                team:objModel.objTeam._id,
                "users.user":obj.user
            },{
                "users.$.role":obj.role
            })
        }

    }


    async moveUser (id:string,user:string,group:string,userId:string){
        let objModel=await this.validate(id,userId)
        let obj=await teamGroup.findOneAndUpdate({
            team:objModel.objTeam._id,
            "users.user":user
        },{
            $pull:{
                "users":{
                    user:user
                }
            }
        });
        if(!obj)
        {
            throw e.userNotInTeam;
        }
        let role:number;
        for(let o of obj.users)
        {
            if(o.user.toString()==user)
            {
                role=o.role;
                break;
            }
        }
        let update={
            user:user,
            role:role
        };
        obj=await teamGroup.findOneAndUpdate({
            _id:group
        },{
            $addToSet:{
                users:update
            }
        });
        if(!obj)
        {
            throw e.groupNotFound;
        }
        let ret={
            user:await userModel.findOne({
                _id:update.user
            },"name photo"),
            role:role
        }
        return ret

    }


    async createGroup (id:string,name:string,group:string,userId:string){
        let objModel=await this.validate(id,userId)
        let obj:InstanceType<TeamGroupModel>;
        if(group)
        {
            obj=await teamGroup.findOneAndUpdate({
                _id:group
            },{
                name:name
            },{
                new:true
            })
        }
        else
        {
            obj=await teamGroup.create({
                name:name,
                team:id
            })
        }
        return obj

    }


    async removeGroup (id:string,group:string,userId:string){
        let objModel=await this.validate(id,userId)
        let obj=await teamGroup.findOne({
            _id:group
        });
        if(!obj)
        {
            throw e.groupNotFound;
        }
        else if(obj.users.length>0)
        {
            throw e.teamGroupNotEmpty;
        }
        await obj.remove();

    }


    async pullProject (id:string,projectId:string,userId:string){
        let objModel=await this.validate(id,userId)
        if(objModel.access==0)
        {
            throw e.userForbidden;
        }
        let obj=await project.findOne({
            _id:projectId
        });
        if(!obj)
        {
            throw e.projectNotFound;
            return;
        }
        await apply.findOneAndUpdate({
            from:objModel.objTeam._id,
            to:obj._id,
            type:1,
            state:0
        },{
            fromType:"TeamModel",
            from:objModel.objTeam._id,
            toType:"ProjectModel",
            to:obj._id,
            type:1,
            state:0,
            creator:userId,
        },{
            upsert:true,
            setDefaultsOnInsert:true
        })

    }


    async userApply (id:string,dis:string,userId:string){
        let objTeam=await this.validateTeam(id)
        let bIn=await this.existUserInTeam(objTeam._id,userId);
        if(bIn)
        {
            throw e.userAlreadyInTeam;
        }
        await apply.findOneAndUpdate({
            from:userId,
            to:objTeam._id,
            type:2,
            state:0
        },{
            dis:dis?dis:"",
            fromType:"UserModel",
            from:userId,
            toType:"TeamModel",
            to:objTeam._id,
            type:2,
            state:0,
            creator:userId,
        },{
            upsert:true,
            setDefaultsOnInsert:true
        })

    }


    async projectApply (id:string,projectId:string,dis:string,userId:string){
        let objTeam=await this.validateTeam(id)
        await apply.findOneAndUpdate({
            from:projectId,
            to:objTeam._id,
            type:3,
            state:0
        },{
            dis:dis?dis:"",
            fromType:"ProjectModel",
            from:projectId,
            toType:"TeamModel",
            to:objTeam._id,
            type:3,
            state:0,
            creator:userId,
        },{
            upsert:true,
            setDefaultsOnInsert:true
        })

    }


    async groupList (id:string,userId:string){
        let objModel=await this.validate(id,userId)
        let arr=await teamGroup.find({
            team:id
        },null,{
            sort:"name"
        });
        return arr

    }


    async saveNotice (id:string,notice:string,content:string,userId:string){
        let objModel=await this.validate(id,userId)
        let obj:InstanceType<TeamModel>;
        if(notice)
        {
            obj=await team.findOneAndUpdate({
                _id:id,
                "notice._id":notice
            },{
                "notice.$.content":content
            },{
                new:true
            })
        }
        else
        {
            obj=await team.findOneAndUpdate({
                _id:id
            },{
                $push:{
                    notice:{
                        $each:[{
                            content:content,
                            date:moment().format("YYYY-MM-DD HH:mm:ss")
                        }],
                        $position:0
                    }
                }
            },{
                new:true
            })
        }
        return  obj.notice[0]

    }


    async getNotice (id:string,page:number,userId:string){
        let objModel=await this.validate(id,userId)
        let arr=objModel.objTeam.notice.slice(page*10,(page+1)*10);
        return arr

    }


    async removeNotice (id:string,notice:string,userId:string){
        let objModel=await this.validate(id,userId)
        await team.findOneAndUpdate({
            _id:id
        },{
            $pull:{
                notice:{
                    _id:notice
                }
            }
        })

    }



    async applyList (id:string,userId:string){
        let objModel=await this.validate(id,userId)
        let arr=await apply.find({
            to:objModel.objTeam._id,
            type:{
                $in:[2,3]
            },
            state:0
        },null,{
            populate:{
                path:"creator",
                select:"name photo"
            },
            sort:"-createdAt"
        });
        arr=await apply.populate(arr,{
            path:"from",
            select:"name"
        });
        arr=await apply.populate(arr,{
            path:"to",
            select:"name"
        });
        return arr

    }

    async handleApply (id:string,applyId:string,state:number,group:string,role:number,userId:string,userName:string){
        let objModel=await this.validate(id,userId)
        let obj=await apply.findOne({
            _id:applyId
        },null,{
            populate:{
                path:"to",
                select:"name photo"
            }
        });
        if(!obj)
        {
            throw e.applyNotFound;
        }
        else if(obj.state!=0)
        {
            throw e.applyAlreadyHandle;
        }
        if(obj.type==2)
        {
            if(state==1)
            {
                let objGroup=await teamGroup.findOne({
                    _id:group
                });
                if(!objGroup)
                {
                    throw e.teamGroupNotFound;
                }
                obj.editor=userId as any;
                if(await this.existUserInTeam(obj.creator.toString(),objModel.objTeam._id))
                {
                    obj.state=3;
                    await obj.save();
                    throw e.userAlreadyInTeam;
                }
                else
                {
                    obj.state=state;
                    await teamGroup.findOneAndUpdate({
                        _id:group
                    },{
                        $addToSet:{
                            users:{
                                user:obj.creator,
                                role:role
                            }
                        }
                    })
                    await message.create({
                        name:state==1?"个人申请已通过":"个人申请被拒绝",
                        dis:`您申请加入团队${(<any>obj.to).name}的请求已经被管理员${userName}${state==1?"通过":"拒绝"}`,
                        user:obj.creator,
                        type:0
                    })
                    await obj.save();
                }
                obj=await apply.populate(obj,{
                    path:"from",
                    select:"name photo"
                })
                return {
                    role:role,
                    user:obj.from
                }
            }
            else
            {
                obj.state=state;
                await message.create({
                    name:state==1?"个人申请已通过":"个人申请被拒绝",
                    dis:`您申请加入团队${(<any>obj.to).name}的请求已经被管理员${userName}${state==1?"通过":"拒绝"}`,
                    user:obj.creator,
                    type:0
                })
                await obj.save();
            }
        }
        else if(obj.type==3)
        {
            let userAddCount=0;
            obj.editor=userId as any;
            let objProject=await project.findOne({
                _id:obj.from
            });
            if(!objProject)
            {
                obj.state=3;
                await obj.save();
                throw e.projectNotFound;
            }
            else if(objProject.team)
            {
                obj.state=3;
                await obj.save();
                if(objProject.team.toString()==obj.to.toString())
                {
                    throw e.projectAlreadyJoinTeam
                }
                else
                {
                    throw e.projectAlreadyJoinTeam
                }

            }
            else
            {
                obj.state=state;
                if(state==1)
                {
                    let arrTeamUser=await this.teamUserList(objModel.objTeam._id);
                    let arrProjectUser=(objProject.users as ProjectUsersModel[]).map(function (obj) {
                        return obj.user.toString();
                    });
                    arrProjectUser.push(objProject.owner.toString());
                    let arr=[];
                    for(let o of arrProjectUser)
                    {
                        if(arrTeamUser.indexOf(o)==-1)
                        {
                            arr.push(o);
                        }
                    }
                    userAddCount=arr.length;
                    if(arr.length>0)
                    {
                        arr=arr.map(function (obj) {
                            return {
                                user:obj,
                                role:1
                            }
                        })
                        let objGroup=await teamGroup.findOneAndUpdate({
                            name:"未命名",
                            team:objModel.objTeam._id
                        },{
                            name:"未命名",
                            team:objModel.objTeam._id,
                            $addToSet:{
                                users:{
                                    $each:arr
                                }
                            }
                        },{
                            upsert:true,
                            setDefaultsOnInsert:true
                        })
                    }
                    objProject.team=objModel.objTeam._id;
                    await objProject.save();
                }
                await message.create({
                    name:state==1?"接口项目申请已通过":"接口项目申请被拒绝",
                    dis:`您申请接口项目${objProject.name}加入团队${(obj.to as any).name}的请求已经被管理员${userName}${state==1?"通过":"拒绝"}`,
                    user:obj.creator,
                    type:1
                })
                await obj.save();
            }
            if(state==1)
            {
                let obj1=await project.findOne({
                    _id:obj.from
                })
                obj1._doc.userCount=obj1.users.length+1;
                obj1._doc.interfaceCount=await interfaceModel.count({
                    project:obj1._id
                })
                obj1._doc.userAddCount=userAddCount;
                return obj1
            }
        }
        else if(obj.type==5)
        {
            let userAddCount=0;
            obj.editor=userId as any;
            let objProject=await docProject.findOne({
                _id:obj.from
            });
            if(!objProject)
            {
                obj.state=3;
                await obj.save();
                throw e.docProjectNotFound;
            }
            else if(objProject.team)
            {
                obj.state=3;
                await obj.save();
                if(objProject.team.toString()==obj.to.toString())
                {
                    throw e.projectAlreadyJoinTeam
                }
                else
                {
                    throw e.projectAlreadyJoinTeam
                }

            }
            else
            {
                obj.state=state;
                if(state==1)
                {
                    let arrTeamUser=await this.teamUserList(objModel.objTeam._id);
                    let arrProjectUser=objProject.users.map(function (obj) {
                        return obj.toString();
                    });
                    arrProjectUser.push(objProject.owner.toString());
                    let arr=[];
                    for(let o of arrProjectUser)
                    {
                        if(arrTeamUser.indexOf(o)==-1)
                        {
                            arr.push(o);
                        }
                    }
                    userAddCount=arr.length;
                    if(arr.length>0)
                    {
                        arr=arr.map(function (obj) {
                            return {
                                user:obj,
                                role:1
                            }
                        })
                        let objGroup=await teamGroup.findOneAndUpdate({
                            name:"未命名",
                            team:objModel.objTeam._id
                        },{
                            name:"未命名",
                            team:objModel.objTeam._id,
                            $addToSet:{
                                users:{
                                    $each:arr
                                }
                            }
                        },{
                            upsert:true,
                            setDefaultsOnInsert:true
                        })
                    }
                    objProject.team=objModel.objTeam._id;
                    await objProject.save();
                }
                await message.create({
                    name:state==1?"文档项目申请已通过":"文档项目申请被拒绝",
                    dis:`您申请文档项目${objProject.name}加入团队${(obj.to as any).name}的请求已经被管理员${userName}${state==1?"通过":"拒绝"}`,
                    user:obj.creator,
                    type:1
                })
                await obj.save();
            }
            if(state==1)
            {
                let obj1=await docProject.findOne({
                    _id:obj.from
                })
                obj1._doc.userCount=obj1.users.length+1;
                obj1._doc.docCount=await doc.count({
                    project:obj1._id
                })
                obj1._doc.userAddCount=userAddCount;
                return obj1
            }
        }
        else if(obj.type==7)
        {
            let userAddCount=0;
            obj.editor=userId as any;
            let objProject=await testProject.findOne({
                _id:obj.from
            });
            if(!objProject)
            {
                obj.state=3;
                await obj.save();
                throw e.testProjectNotFound;
            }
            else if(objProject.team)
            {
                obj.state=3;
                await obj.save();
                if(objProject.team.toString()==obj.to.toString())
                {
                    throw e.projectAlreadyJoinTeam
                }
                else
                {
                    throw e.projectAlreadyJoinTeam
                }

            }
            else
            {
                obj.state=state;
                if(state==1)
                {
                    let arrTeamUser=await this.teamUserList(objModel.objTeam._id);
                    let arrProjectUser=objProject.users.map(function (obj) {
                        return obj.toString();
                    });
                    arrProjectUser.push(objProject.owner.toString());
                    let arr=[];
                    for(let o of arrProjectUser)
                    {
                        if(arrTeamUser.indexOf(o)==-1)
                        {
                            arr.push(o);
                        }
                    }
                    userAddCount=arr.length;
                    if(arr.length>0)
                    {
                        arr=arr.map(function (obj) {
                            return {
                                user:obj,
                                role:1
                            }
                        })
                        let objGroup=await teamGroup.findOneAndUpdate({
                            name:"未命名",
                            team:objModel.objTeam._id
                        },{
                            name:"未命名",
                            team:objModel.objTeam._id,
                            $addToSet:{
                                users:{
                                    $each:arr
                                }
                            }
                        },{
                            upsert:true,
                            setDefaultsOnInsert:true
                        })
                    }
                    objProject.team=objModel.objTeam._id;
                    await objProject.save();
                }
                await message.create({
                    name:state==1?"接口项目申请已通过":"接口项目申请被拒绝",
                    dis:`您申请接口项目${objProject.name}加入团队${(obj.to as any).name}的请求已经被管理员${userName}${state==1?"通过":"拒绝"}`,
                    user:obj.creator,
                    type:1
                })
                await obj.save();
            }
            if(state==1)
            {
                let obj1=await testProject.findOne({
                    _id:obj.from
                })
                obj1._doc.userCount=obj1.users.length+1;
                obj1._doc.testCount=await test.count({
                    project:obj1._id
                })
                obj1._doc.userAddCount=userAddCount;
                return obj1
            }
        }

    }


    async removeProject (id:string,projectId:string,userId:string){
        let objModel=await this.validate(id,userId)
        let obj=await project.findOneAndUpdate({
            _id:projectId,
            team:id
        },{
            $unset:{
                team:null
            }
        })

    }


    async userPulledList (id:string,projectId:string,userId:string){
        let objModel=await this.validate(id,userId)
        let arrTeamUser=await this.teamUserList(objModel.objTeam._id);
        let obj=await project.findOne({
            _id:projectId
        },null,{
            populate:{
                path:"users.user",
                select:"name photo"
            }
        });
        if(!obj)
        {
            throw e.projectNotFound;
        }
        let arrProjectUser=(obj.users as ProjectUsersModel[]).map(function (obj) {
            return obj.user;
        })
        let arr:UserModel[]=[];
        for(let o of arrProjectUser)
        {
            let bFind=false;
            for(let o1 of arrTeamUser)
            {
                if(o1==(o as UserModel)._id.toString())
                {
                    bFind=true;
                    break;
                }
            }
            if(!bFind)
            {
                arr.push(o as UserModel);
            }
        }
        return arr

    }


    async userJoin (id:string,group:string,user:string,role:number,userId:string){
        let objModel=await this.validate(id,userId)
        if(await this.existUserInTeam(objModel.objTeam._id,user))
        {
            throw e.userAlreadyInTeam;
        }
        else
        {
            await teamGroup.findOneAndUpdate({
                _id:group
            },{
                $addToSet:{
                    users:{
                        user:user,
                        role:role
                    }
                }
            })
        }

    }


    async removeTeam (id:string,userId:string){
        let objModel=await this.validate(id,userId)
        if(objModel.objTeam.owner.toString()!=userId)
        {
            throw e.userForbidden;
        }
        await project.update({
            team:objModel.objTeam._id
        },{
            $unset:{
                team:null
            }
        },{
            multi:true
        });
        await teamGroup.remove({
            team:objModel.objTeam._id
        })
        await objModel.objTeam.remove();

    }

    async transfer (id:string,user:string,userId:string){
        let objModel=await this.validate(id,userId)
        if(userId!=objModel.objTeam.owner.toString())
        {
            throw e.userForbidden;
        }
        let u=await userModel.findOne({
            _id:user
        });
        if(!u)
        {
            throw e.userNotFound;
        }
        await teamGroup.findOneAndUpdate({
            team:id,
            "users.user":userId
        },{
            "users.$.role":0
        })
        await teamGroup.findOneAndUpdate({
            team:id,
            "users.user":user
        },{
            "users.$.role":2
        })
        objModel.objTeam.owner=user as any;
        await objModel.objTeam.save();

    }

    async userList (id:string,userId:string){
        let objModel=await this.validate(id,userId)
        let ret=await teamGroup.find({
            team:objModel.objTeam._id
        },null,{
            sort:"name",
            populate:{
                path:"users.user",
                select:"name photo"
            }
        })
        return ret

    }

    async list (userId:string){
        let obj=<{
            create:InstanceType<TeamModel>[],
            join:InstanceType<TeamModel>[]
        }>{},ret=[];
        let arr=await team.find({
            owner:userId
        },"",{
            sort:"-createdAt"
        })
        arr.forEach(function (obj) {
            obj._doc.role=0;
            obj._doc.own=1;
        })
        for(let obj of arr)
        {
            let arr1=await teamGroup.find({
                team:obj._id
            })
            let count=0;
            for(let o of arr1)
            {
                count+=o.users.length;
            }
            obj._doc.userCount=count;
            obj._doc.projectCount=await project.count({
                team:obj._id
            })
            obj._doc.docCount=await docProject.count({
                team:obj._id
            })
            obj._doc.testCount=await testProject.count({
                team:obj._id
            })
        }
        obj.create=arr;
        let arrTemp=await teamGroup.find({
            users:{
                $elemMatch:{
                    user:userId,
                    role:0
                }
            }
        },"",{
            sort:"-createdAt"
        })
        let arrTeam=[];
        for(let obj of arrTemp)
        {
            if(arrTeam.indexOf(obj.team.toString())==-1)
            {
                arrTeam.push(obj.team);
            }
        }
        arr=await team.find({
            _id:{
                $in:arrTeam
            }
        },"",{
            sort:"-createdAt"
        })
        arr.forEach(function (obj) {
            obj._doc.own=0;
            obj._doc.role=0;
        })
        ret=arr;
        arrTemp=await teamGroup.find({
            users:{
                $elemMatch:{
                    user:userId,
                    role:1
                }
            }
        },"",{
            sort:"-createdAt"
        })
        arrTeam=[];
        for(let obj of arrTemp)
        {
            if(arrTeam.indexOf(obj.team.toString())==-1)
            {
                arrTeam.push(obj.team);
            }
        }
        arr=await team.find({
            _id:{
                $in:arrTeam
            }
        },"",{
            sort:"-createdAt"
        })
        arr.forEach(function (obj) {
            obj._doc.own=0;
            obj._doc.role=1;
        })
        ret=ret.concat(arr);
        for(let obj of ret)
        {
            let arr=await teamGroup.find({
                team:obj._id
            })
            let count=0;
            for(let o of arr)
            {
                count+=o.users.length;
            }
            obj._doc.userCount=count;
            obj._doc.projectCount=await project.count({
                team:obj._id
            })
            obj._doc.docCount=await docProject.count({
                team:obj._id
            })
            obj._doc.testCount=await testProject.count({
                team:obj._id
            })
        }
        obj.join=ret;
        return obj

    };

    async projectList (id:string,userId:string){
        let objModel=await this.validate(id,userId)
        let ret:InstanceType<ProjectModel>[]=[];
        if(objModel.access)
        {
            ret=await project.find({
                team:objModel.objTeam._id
            },"name dis users createdAt",{
                sort:"-createdAt"
            });
            ret.forEach(function (obj) {
                obj._doc.role=0;
                obj._doc.own=1;
            })
        }
        else
        {
            let arr=await project.find({
                owner:userId,
                team:objModel.objTeam._id
            },"name dis users createdAt",{
                sort:"-createdAt"
            });
            arr.forEach(function (obj) {
                obj._doc.role=0;
                obj._doc.own=1;
            })
            ret=ret.concat(arr);
            arr=await project.find({
                users:{
                    $elemMatch:{
                        user:userId,
                        role:0
                    }
                },
                team:objModel.objTeam._id
            },"name dis users createdAt",{
                sort:"-createdAt"
            })
            arr.forEach(function (obj) {
                obj._doc.own=0;
                obj._doc.role=0;
            })
            ret=ret.concat(arr);
            arr=await project.find({
                users:{
                    $elemMatch:{
                        user:userId,
                        role:1
                    }
                },
                team:objModel.objTeam._id
            },"name dis users createdAt",{
                sort:"-createdAt"
            })
            arr.forEach(function (obj) {
                obj._doc.own=0;
                obj._doc.role=1;
            })
            ret=ret.concat(arr);
        }
        ret.sort(function (obj1,obj2) {
            if(obj1.createdAt>obj2.createdAt)
            {
                return -1;
            }
            else if(obj1.createdAt<obj2.createdAt)
            {
                return 1;
            }
            else
            {
                return 0;
            }
        })
        for(let obj of ret)
        {
            obj._doc.userCount=obj.users.length+1;
            delete obj._doc.users;
            obj._doc.interfaceCount=await interfaceModel.count({
                project:obj._id
            })
        }
        return ret

    }


    async docList (id:string,userId:string){
        let objModel=await this.validate(id,userId)
        let arr:InstanceType<DocProjectModel>[];
        if(objModel.access)
        {
            arr=await docProject.find({
                team:id
            },null,{
                sort:"-createdAt"
            });
            arr.forEach(function (obj) {
                obj._doc.own=1;
                obj._doc.role=0;
            })
        }
        else
        {
            arr=await docProject.find({
                $or:[
                    {
                        $or:[
                            {
                                owner:userId
                            },
                            {
                                users:userId
                            }
                        ],
                        publicTeam:0
                    },
                    {
                        publicTeam:1
                    }
                ],
                team:id
            },null,{
                sort:"-createdAt"
            });
            arr.forEach(function (obj) {
                if(userId==obj.owner.toString())
                {
                    obj._doc.own=1;
                    obj._doc.role=0;
                }
                else
                {
                    let arrUsers=obj.users.map(function (obj) {
                        return obj.toString();
                    })
                    if(arrUsers.indexOf(userId)>-1)
                    {
                        obj._doc.role=0;
                    }
                    else
                    {
                        obj._doc.role=1;
                    }
                }
            })
        }
        for(let o of arr)
        {
            o._doc.docCount=await doc.count({
                project:o._id
            })
            o._doc.userCount=o.users.length+1;
            delete o._doc.users;
        }
        return arr

    }

    async testList (id:string,userId:string){
        let objModel=await this.validate(id,userId)
        let arr:InstanceType<TestProjectModel>[];
        if(objModel.access)
        {
            arr=await testProject.find({
                team:id
            },null,{
                sort:"-createdAt"
            });
            arr.forEach(function (obj) {
                obj._doc.own=1;
                obj._doc.role=0;
            })
        }
        else
        {
            arr=await testProject.find({
                $or:[
                    {
                        owner:userId
                    },
                    {
                        users:userId
                    }
                ],
                team:id
            },null,{
                sort:"-createdAt"
            });
            arr.forEach(function (obj) {
                if(userId==obj.owner.toString())
                {
                    obj._doc.own=1;
                    obj._doc.role=0;
                }
                else
                {
                    obj._doc.own=0;
                    obj._doc.role=0;
                }
            })
        }
        for(let o of arr)
        {
            o._doc.testCount=await test.count({
                project:o._id
            })
            o._doc.userCount=o.users.length+1;
            delete o._doc.users;
        }
        return arr

    }

    async removeDoc (id:string,project:string,userId:string){
        let objModel=await this.validate(id,userId)
        let obj=await docProject.findOneAndUpdate({
            _id:project,
            team:id
        },{
            $unset:{
                team:null
            }
        })

    }

    async docUser (id:string,project:string,userId:string){
        let objModel=await this.validate(id,userId)
        let objPro=await docProject.findOne({
            _id:project
        })
        if(!objPro)
        {
            throw e.projectNotFound;
            return;
        }
        let arr=objPro.users.map(function (obj) {
            return obj.toString();
        });
        let arrUser=await teamGroup.find({
            team:objModel.objTeam._id
        },null,{
            populate:{
                path:"users.user",
                select:"name photo"
            }
        })
        for(let obj of arrUser)
        {
            for(let obj1 of obj.users)
            {
                if((obj1.user as UserModel)._id.toString()==objPro.owner.toString())
                {
                    // @ts-ignore
                    obj1._doc.select=1;
                    // @ts-ignore
                    obj1._doc.role=2;
                }
                else
                {
                    let index=arr.indexOf((obj1.user as UserModel)._id.toString());
                    if(index>-1)
                    {
                        // @ts-ignore
                        obj1._doc.select=1;
                        // @ts-ignore
                        obj1._doc.role=0;
                    }
                    else
                    {
                        // @ts-ignore
                        obj1._doc.select=0;
                        // @ts-ignore
                        obj1._doc.role=0;
                    }
                }
            }
        }
        return arrUser

    }

    async pullDoc (id:string,project:string,userId:string){
        let objModel=await this.validate(id,userId)
        let obj=await docProject.findOne({
            _id:project
        });
        if(!obj)
        {
            throw e.docProjectNotFound;
            return;
        }
        await apply.findOneAndUpdate({
            from:objModel.objTeam._id,
            to:obj._id,
            type:4,
            state:0
        },{
            fromType:"TeamModel",
            from:objModel.objTeam._id,
            toType:"DocProjectModel",
            to:obj._id,
            type:4,
            state:0,
            creator:userId,
        },{
            upsert:true,
            setDefaultsOnInsert:true
        })

    }

    async docApply (id:string,project:string,dis:string,userId:string){
        let objModel=await this.validate(id,userId)
        await apply.findOneAndUpdate({
            from:project,
            to:objModel.objTeam._id,
            type:5,
            state:0
        },{
            dis:dis?dis:"",
            fromType:"DocProjectModel",
            from:project,
            toType:"TeamModel",
            to:objModel.objTeam._id,
            type:5,
            state:0,
            creator:userId,
        },{
            upsert:true,
            setDefaultsOnInsert:true
        })

    }

    async removeTest (id:string,project:string,userId:string){
        let objModel=await this.validate(id,userId)
        let obj=await testProject.findOneAndUpdate({
            _id:project,
            team:id
        },{
            $unset:{
                team:null
            }
        })

    }

    async testUser (id:string,project:string,userId:string){
        let objModel=await this.validate(id,userId)
        let objPro=await testProject.findOne({
            _id:project
        })
        if(!objPro)
        {
            throw e.testProjectNotFound;
            return;
        }
        let arr=objPro.users.map(function (obj) {
            return obj.toString();
        });
        let arrUser=await teamGroup.find({
            team:objModel.objTeam._id
        },null,{
            populate:{
                path:"users.user",
                select:"name photo"
            }
        })
        for(let obj of arrUser)
        {
            for(let obj1 of obj.users)
            {
                if((obj1.user as UserModel)._id.toString()==objPro.owner.toString())
                {
                    // @ts-ignore
                    obj1._doc.select=1;
                    // @ts-ignore
                    obj1._doc.role=2;
                }
                else
                {
                    let index=arr.indexOf((obj1.user as UserModel)._id.toString());
                    if(index>-1)
                    {
                        // @ts-ignore
                        obj1._doc.select=1;
                        // @ts-ignore
                        obj1._doc.role=0;
                    }
                    else
                    {
                        // @ts-ignore
                        obj1._doc.select=0;
                        // @ts-ignore
                        obj1._doc.role=0;
                    }
                }
            }
        }
        return arrUser

    }

    async pullTest (id:string,project:string,userId:string){
        let objModel=await this.validate(id,userId)
        let obj=await testProject.findOne({
            _id:project
        });
        if(!obj)
        {
            throw e.testProjectNotFound;
            return;
        }
        await apply.findOneAndUpdate({
            from:objModel.objTeam._id,
            to:obj._id,
            type:6,
            state:0
        },{
            fromType:"TeamModel",
            from:objModel.objTeam._id,
            toType:"TestProjectModel",
            to:obj._id,
            type:6,
            state:0,
            creator:userId,
        },{
            upsert:true,
            setDefaultsOnInsert:true
        })

    }

    async testApply (id:string,project:string,dis:string,userId:string){
        let objTeam=await this.validateTeam(id)
        await apply.findOneAndUpdate({
            from:project,
            to:objTeam._id,
            type:7,
            state:0
        },{
            dis:dis?dis:"",
            fromType:"TestProjectModel",
            from:project,
            toType:"TeamModel",
            to:objTeam._id,
            type:7,
            state:0,
            creator:userId,
        },{
            upsert:true,
            setDefaultsOnInsert:true
        })

    }
}


export=new TeamDao;


