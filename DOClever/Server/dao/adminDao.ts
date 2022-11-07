import e=require("../util/error.json");
import user=require("../model/userModel")
import admin=require("../model/adminModel")
import teamGroup=require("../model/teamGroupModel")
import project=require("../model/projectModel")
import team=require("../model/teamModel")
import interfaceModel=require("../model/interfaceModel")
import groupVersion=require("../model/groupVersionModel")
import interfaceVersion=require("../model/interfaceVersionModel")
import interfaceSnapshot=require("../model/interfaceSnapshotModel")
import statusVersion=require("../model/statusVersionModel")
import test=require("../model/testModel")
import testModule=require("../model/testModuleModel")
import testGroup=require("../model/testGroupModel")
import testProject=require("../model/testProjectModel")
import testCollection=require("../model/testCollectionModel")
import group=require("../model/groupModel")
import status=require("../model/statusModel")
import poll=require("../model/pollModel")
import version=require("../model/versionModel")
import statistic=require("../model/statisticModel")
import template=require("../model/templateModel")
import example=require("../model/exampleModel")
import info=require("../model/infoModel")
import doc=require("../model/docModel")
import docProject=require("../model/docProjectModel")
import docGroup=require("../model/docGroupModel")
import util=require("../util/util");
import fs=require("fs-extra");
import config=require("../../config.json")
import uuid=require("uuid");
import path=require("path");
import mongoose=require("mongoose");
import {InstanceType} from "typegoose";
import {
    DocProjectModel,
    ProjectModel,
    ProjectUsersModel,
    TeamGroupModel,
    TeamModel,
    TestProjectModel,
    UserModel,
    TeamGroupUsersModel, AdminModel
} from "../model/types";
var objectId = mongoose.Types.ObjectId;
class AdminDao {
    isInstanceProjectType(obj:any):obj is InstanceType<ProjectModel> {
        return obj._id && obj.user
    }
    async editPassword(oldPassword:string,admin:InstanceType<AdminModel>)
    {
        if(admin.password!=oldPassword)
        {
            throw e.passwordWrong;
        }
        admin.password=oldPassword;
        await admin.save();
    }
    async teamUserList(teamId) {
        let arrUser=await teamGroup.find({
            team:teamId
        })
        let arr=[];
        arrUser.forEach(function (obj) {
            return obj.users.forEach(function (obj) {
                arr.push(obj.user.toString());
            })
        })
        return arr;
    }
    async existUserInTeam(teamId,userId){
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
    async projectRemove(id,category){
        if(category==0)
        {
            let obj=await project.findOne({
                _id:id
            })
            if(!obj)
            {
                throw (e.projectNotFound);
            }
            await interfaceModel.remove({
                project:id
            });
            await version.remove({
                project:id
            });
            await interfaceVersion.remove({
                project:id
            });
            await interfaceSnapshot.remove({
                project:id
            });
            await group.remove({
                project:id
            })
            await groupVersion.remove({
                project:id
            })
            await status.remove({
                project:id
            })
            await statusVersion.remove({
                project:id
            })
            await test.remove({
                project:id
            })
            let arrTestModule=await testModule.find({
                project:id
            })
            for(let obj of arrTestModule)
            {
                await testGroup.remove({
                    module:obj._id
                })
            }
            await testModule.remove({
                project:id
            })
            await poll.remove({
                project:id
            })
            await template.remove({
                project:id
            })
            await example.remove({
                project:id
            })
            await project.remove({
                _id:id
            })
        }
        else if(category==1)
        {
            let obj=await docProject.findOne({
                _id:id
            })
            if(!obj)
            {
                throw (e.projectNotFound);
            }
            await docGroup.remove({
                project:id
            })
            await doc.remove({
                project:id
            })
        }
        else if(category==2)
        {
            let obj=await testProject.findOne({
                _id:id
            })
            if(!obj)
            {
                throw (e.projectNotFound);
            }
            await testModule.remove({
                project:id
            })
            await testGroup.remove({
                project:id
            })
            await test.remove({
                project:id
            })
            await testCollection.remove({
                project:id
            })
            await poll.remove({
                project:id
            })
        }
    }
    async userRemove(id){
        let arrProject=await project.find({
            owner:id
        });
        let arrTeam=await teamGroup.find({
            owner:id
        })
        let arrDoc=await docProject.find({
            owner:id
        })
        if(arrProject.length>0 || arrTeam.length>0 || arrDoc.length>0)
        {
            throw (e.systemReason);
        }
        await project.update({
            "users.user":id
        },{
            $pull:{
                users:{
                    user:id
                }
            }
        })
        await teamGroup.update({
            "users.user":id
        },{
            $pull:{
                users:{
                    user:id
                }
            }
        })
        await docProject.update({
            "users":id
        },{
            $pull:{
                users:id
            }
        })
        await user.remove({
            _id:id
        })
    }
    async handleLogin(name,password){
        let obj=await admin.findOneAndUpdate({
            name:name,
            password:password
        },{
            lastLoginDate:Date.now(),
            $inc:{
                loginCount:1
            }
        },{
            new:true
        })
        return obj;
    }
    async userStatistics(){
        let obj=<{
            total:number,
            register:number,
            login:number
        }>{};
        obj.total=await user.count({});
        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        obj.register=await user.count({
            createdAt:{
                $gt:date
            }
        })
        obj.login=await user.count({
            lastLoginDate:{
                $gt:date
            }
        })
        return obj;
    }
    async userList(type,key,page){
        let arr:InstanceType<UserModel>[],query={},sort;
        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        if(type==0)
        {
            query={
                createdAt:{
                    $gt:date
                }
            }
            sort="-createdAt";
        }
        else if(type==1)
        {
            query={
                lastLoginDate:{
                    $gt:date
                }
            }
            sort="-lastLoginDate"
        }
        else if(type==2)
        {
            sort="-loginCount"
        }
        else if(type==3)
        {
            query={
                name:new RegExp(key?key:"","i")
            };
            sort="name";
        }
        else if(type==4)
        {
            let today=new Date();
            let t=today.getTime()-1000*60*60*24*10;
            var newDay=new Date(t);
            query={
                lastLoginDate:{
                    $gt:newDay
                },
                loginCount:{
                    $gte:10
                }
            };
            sort="name";
            arr=await user.find(query,"name photo createdAt lastLoginDate loginCount state",{
                sort:sort
            });
            let ret:InstanceType<UserModel>[]=[];
            for(let obj of arr)
            {
                let bOK=false;
                let arrProject=await project.find({
                    $or:[
                        {
                            owner:obj._id
                        },
                        {
                            "users.user":obj._id
                        }
                    ]
                })
                for(let obj1 of arrProject)
                {
                    let count=await interfaceModel.count({
                        project:obj1._id
                    });
                    if(count>=5)
                    {
                        bOK=true;
                        break;
                    }
                }
                if(bOK)
                {
                    ret.push(obj);
                }
            }
            ret=ret.slice(page*10,10+page*10);
            return ret
        }
        arr=await user.find(query,"name photo createdAt lastLoginDate loginCount state",{
            sort:sort,
            skip:10*page,
            limit:10
        })
        return arr;
    }
    async getUserInfo(id){
        let obj=await user.findOne({
            _id:id
        });
        return obj;
    }
    async userCreate(param,id?,photo?){
        if(id)
        {
            let update:any={};
            for(let key in param)
            {
                if(key!="id")
                {
                    update[key]=param[key];
                }
            }
            let ret=await user.findOne({
                name:update.name,
                _id:{
                    $ne:id
                }
            });
            if(ret)
            {
                throw (e.duplicateUser);
            }
            let obj=await user.findOneAndUpdate({
                _id:id
            },update,{
                new:false
            });
            if(!obj)
            {
                throw (e.userNotFound);
            }
            else if(photo && obj.photo && photo!=obj.photo)
            {
                util.delImg(obj.photo);
            }
            obj=await user.findOne({
                _id:id
            },"-password");
            return obj
        }
        else
        {
            let obj:any={};
            for(let key in param)
            {
                obj[key]=param[key];
            }
            if(!obj.name || !obj.password)
            {
                throw (e.paramWrong);
            }
            let ret=await user.findOne({
                name:obj.name
            });
            if(ret)
            {
                throw (e.duplicateUser);
            }
            let objUser=await user.create(obj);
            delete objUser._doc.password;
            return objUser;
        }
    }
    async projectStatistics(){
        let obj=<{
            interfaceTotal:number,
            interfaceToday:number,
            docTotal:number,
            docToday:number,
            testTotal:number,
            testToday:number
        }>{};
        obj.interfaceTotal=await project.count({});
        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        obj.interfaceToday=await project.count({
            createdAt:{
                $gt:date
            }
        })
        obj.docTotal=await docProject.count({});
        obj.docToday=await docProject.count({
            createdAt:{
                $gt:date
            }
        })
        obj.testTotal=await testProject.count({});
        obj.testToday=await testProject.count({
            createdAt:{
                $gt:date
            }
        })
        return obj;
    }
    async projectList(type,key,page,category){
        let query={},sort;
        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        if(type==0)
        {
            query={
                createdAt:{
                    $gt:date
                }
            }
            sort="-createdAt";
        }
        else if(type==1)
        {
            query={
                name:new RegExp(key?key:"","i")
            };
            sort="name";
        }
        if(category==0)
        {
            let arr=await project.find(query,null,{
                sort:sort,
                skip:10*page,
                limit:10,
                populate:{
                    path:"owner",
                    select:"name photo"
                }
            })
            arr=await project.populate(arr,{
                path:"team",
                select:"name"
            })
            for(let obj of arr)
            {
                obj._doc.userCount=obj.users.length+1;
                delete obj._doc.users;
                obj._doc.interfaceCount=await interfaceModel.count({
                    project:obj._id
                })
            }
            return arr;
        }
        else if(category==1)
        {
            let arr=await docProject.find(query,null,{
                sort:sort,
                skip:10*page,
                limit:10,
                populate:{
                    path:"owner",
                    select:"name photo"
                }
            })
            arr=await docProject.populate(arr,{
                path:"team",
                select:"name"
            })
            for(let obj of arr)
            {
                obj._doc.userCount=obj.users.length+1;
                delete obj._doc.users;
                obj._doc.docCount=await doc.count({
                    project:obj._id
                })
            }
            return arr;
        }
        else
        {
            let arr=await testProject.find(query,null,{
                sort:sort,
                skip:10*page,
                limit:10,
                populate:{
                    path:"owner",
                    select:"name photo"
                }
            })
            arr=await testProject.populate(arr,{
                path:"team",
                select:"name"
            })
            for(let obj of arr)
            {
                obj._doc.userCount=obj.users.length+1;
                delete obj._doc.users;
                obj._doc.testCount=await test.count({
                    project:obj._id
                })
            }
            return arr;
        }
    }
    async projectInfo(id,category){
        let model;
        if(category==0)
        {
            model=project;
        }
        else if(category==1)
        {
            model=docProject;
        }
        else if(category==2)
        {
            model=testProject;
        }
        let obj:InstanceType<DocProjectModel>|InstanceType<ProjectModel>|InstanceType<TestProjectModel>=await model.findOne({
            _id:id
        },"",{
            populate:{
                path:"owner",
                select:"name photo"
            }
        });
        if(!obj)
        {
            throw (e.projectNotFound);
        }
        else
        {
            obj=await model.populate(obj,{
                path:"team",
                select:"name"
            })
        }
        return obj;
    }
    async projectEdit(id,name,dis,isPublic,category){
        let model:typeof project|typeof docProject|typeof testProject,update={};
        if(category==0)
        {
            model=project;
            update={
                name:name,
                dis:dis,
                public:isPublic
            }
        }
        else if(category==1)
        {
            model=docProject;
            update={
                name:name,
                dis:dis,
                public:isPublic
            }
        }
        else if(category==2)
        {
            model=testProject;
            update={
                name:name,
                dis:dis,
            }
        }
        let obj=await model.findOneAndUpdate({
            _id:id
        },update,{
            new:true
        })
        if(!obj)
        {
            throw (e.projectNotFound);
        }
        return obj;
    }
    async teamStatistics(){
        let obj=<{
            total:number,
            today:number
        }>{};
        obj.total=await team.count({});
        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        obj.today=await team.count({
            createdAt:{
                $gt:date
            }
        })
        return obj;
    }
    async teamList(type,key,page){
        let query={},sort;
        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        if(type==0)
        {
            query={
                createdAt:{
                    $gt:date
                }
            }
            sort="-createdAt";
        }
        else if(type==1)
        {
            query={
                name:new RegExp(key?key:"","i")
            };
            sort="name";
        }
        let arr=await team.find(query,null,{
            sort:sort,
            skip:10*page,
            limit:10,
            populate:{
                path:"owner",
                select:"name photo"
            }
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
            count=await project.count({
                team:obj._id
            })
            count+=await docProject.count({
                team:obj._id
            })
            count+=await testProject.count({
                team:obj._id
            })
            obj._doc.projectCount=count
        }
        return arr;
    }
    async teamInfo(id){
        let obj=await team.findOne({
            _id:id
        },"",{
            populate:{
                path:"owner",
                select:"name photo"
            }
        });
        if(!obj)
        {
            throw (e.projectNotFound);
        }
        return obj;
    }
    async teamRemove(id){
        let obj=await team.findOne({
            _id:id
        });
        if(!obj)
        {
            throw (e.projectNotFound);
        }
        await project.update({
            team:obj._id
        },{
            $unset:{
                team:null
            }
        },{
            multi:true
        });
        await teamGroup.remove({
            team:obj._id
        })
        await obj.remove();
    }
    async interfaceStatistics(){
        let obj=<{
            interface:{
                total:number,
                today:number
            },
            doc:{
                total:number,
                today:number
            },
            test:{
                total:number,
                today:number
            }
        }>{
            interface:{},
            doc:{},
            test:{},
        };
        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        obj.interface.total=await interfaceModel.count({});
        obj.interface.today=await interfaceModel.count({
            createdAt:{
                $gt:date
            }
        })
        obj.doc.total=await doc.count({});
        obj.doc.today=await doc.count({
            createdAt:{
                $gt:date
            }
        })
        obj.test.total=await test.count({});
        obj.test.today=await test.count({
            createdAt:{
                $gt:date
            }
        })
        return obj;
    }
    async userProjectList (id){
        let ret=<{
            own:InstanceType<ProjectModel>[],
            join:InstanceType<ProjectModel>[]
        }>{};
        let arrOwn=await project.find({
            owner:id
        },"",{
            sort:"name",
            populate:{
                path:"team",
                select:"name"
            }
        })
        for(let obj of arrOwn)
        {
            obj._doc.userCount=obj.users.length+1;
            delete obj._doc.users
            obj._doc.interfaceCount=await interfaceModel.count({
                project:obj._id
            })
        }
        ret.own=arrOwn;
        let arrManage=await project.find({
            users:{
                $elemMatch:{
                    role:0,
                    user:id
                }
            }
        },"",{
            sort:"name",
            populate:{
                path:"team",
                select:"name"
            }
        })
        arrManage=await project.populate(arrManage,{
            path:"owner",
            select:"name"
        })
        for(let obj of arrManage)
        {
            obj._doc.role=0;
            obj._doc.userCount=obj.users.length+1;
            obj._doc.interfaceCount=await interfaceModel.count({
                project:obj._id
            })
            for(let obj1 of obj.users)
            {
                if((obj1 as ProjectUsersModel).user.toString()==id)
                {
                    obj._doc.option=(obj1 as ProjectUsersModel).option
                    break;
                }
            }
            delete obj._doc.users
        }
        let arrJoin=await project.find({
            users:{
                $elemMatch:{
                    role:1,
                    user:id
                }
            }
        },"",{
            sort:"name",
            populate:{
                path:"team",
                select:"name"
            }
        })
        arrJoin=await project.populate(arrJoin,{
            path:"owner",
            select:"name"
        })
        for(let obj of arrJoin)
        {
            obj._doc.role=1;
            obj._doc.userCount=obj.users.length+1;
            obj._doc.interfaceCount=await interfaceModel.count({
                project:obj._id
            })
            for(let obj1 of obj.users)
            {
                if((obj1 as ProjectUsersModel).user.toString()==id)
                {
                    obj._doc.option=(obj1 as ProjectUsersModel).option
                    break;
                }
            }
            delete obj._doc.users
        }
        arrManage=arrManage.concat(arrJoin);
        ret.join=arrManage;
        return ret;
    }
    async userTeamList (id){
        let ret=<{
            own:InstanceType<TeamModel>[],
            join:InstanceType<TeamModel>[]
        }>{};
        let arr=await team.find({
            owner:id
        },"",{
            sort:"name",
            populate:{
                path:"owner",
                select:"name"
            }
        })
        ret.own=arr;
        let arrTeam=[];
        let arrTemp=await teamGroup.find({
            users:{
                $elemMatch:{
                    user:id,
                    role:0
                }
            }
        },"",{
            sort:"-createdAt"
        })
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
            sort:"name",
            populate:{
                path:"owner",
                select:"name"
            }
        })
        for(let obj of arr)
        {
            obj._doc.role=0;
        }
        ret.join=arr;
        arrTemp=await teamGroup.find({
            users:{
                $elemMatch:{
                    user:id,
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
            sort:"name",
            populate:{
                path:"owner",
                select:"name"
            }
        })
        for(let obj of arr)
        {
            obj._doc.role=1;
        }
        ret.join=ret.join.concat(arr);
        let arrRet=[ret.own,ret.join];
        for(let model of arrRet)
        {
            for(let obj of model)
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
            }
        }
        return ret;
    }
    async userRemoveProject (id){
        let obj=await project.findOne({
            _id:id
        })
        if(!obj)
        {
            throw (e.projectNotFound);
        }
        await interfaceModel.remove({
            project:id
        });
        await version.remove({
            project:id
        });
        await interfaceVersion.remove({
            project:id
        });
        await interfaceSnapshot.remove({
            project:id
        });
        await group.remove({
            project:id
        })
        await groupVersion.remove({
            project:id
        })
        await status.remove({
            project:id
        })
        await statusVersion.remove({
            project:id
        })
        await test.remove({
            project:id
        })
        let arrTestModule=await testModule.find({
            project:id
        })
        for(let obj of arrTestModule)
        {
            await testGroup.remove({
                module:obj._id
            })
        }
        await testModule.remove({
            project:id
        })
        await poll.remove({
            project:id
        })
        await project.remove({
            _id:id
        })
    }
    async userRemoveTeam (id){
        let obj=await team.findOne({
            _id:id
        });
        if(!obj)
        {
            throw (e.projectNotFound);
        }
        await project.update({
            team:obj._id
        },{
            $unset:{
                team:null
            }
        },{
            multi:true
        });
        await teamGroup.remove({
            team:obj._id
        })
        await obj.remove();
    }
    async userTransferProject (id,username,category){
        let model;
        if(category==0)
        {
            model=project;
        }
        else if(category==1)
        {
            model=docProject;
        }
        else if(category==2)
        {
            model=testProject;
        }
        let obj=await model.findOne({
            _id:id
        })
        if(!obj)
        {
            throw (e.projectNotFound);
            return;
        }
        let objProject=obj;
        obj=await user.findOne({
            name:username
        })
        if(!obj)
        {
            throw (e.userNotFound);
            return;
        }
        let bInTeam=false;
        if(objProject.team)
        {
            let bIn=await this.existUserInTeam(objProject.team,obj._id);
            if(!bIn)
            {
                throw (e.userNotInTeam);
            }
            else
            {
                bInTeam=true;
            }
        }
        if(category==0)
        {
            let bFind=false;
            for(let o of objProject.users)
            {
                if(o.user.toString()==obj._id.toString())
                {
                    bFind=true;
                    break;
                }
            }
            if(bFind)
            {
                await project.update({
                    _id:id
                },{
                    owner:obj._id,
                    $pull:{
                        "users":{
                            user:obj._id
                        }
                    }
                })
            }
            else
            {
                if(bInTeam || !objProject.team)
                {
                    objProject.owner=obj._id;
                    await objProject.save();
                }
                else
                {
                    throw (e.userNotInProject);
                }
            }
        }
        else
        {
            let bFind=false;
            for(let o of objProject.users)
            {
                if(o.toString()==obj._id.toString())
                {
                    bFind=true;
                    break;
                }
            }
            if(bFind)
            {
                await project.update({
                    _id:id
                },{
                    owner:obj._id,
                    $pull:{
                        "users":obj._id
                    }
                })
            }
            else
            {
                if(bInTeam || !objProject.team)
                {
                    objProject.owner=obj._id;
                    await objProject.save();
                }
                else
                {
                    throw (e.userNotInProject);
                }
            }
        }
    }
    async userTransferTeam (id,username){
        let obj=await team.findOne({
            _id:id
        })
        if(!obj)
        {
            throw (e.teamNotFound);
            return;
        }
        let objTeam=obj;
        let u=await user.findOne({
            name:username
        });
        if(!u)
        {
            throw (e.userNotFound);
        }
        let bExist=await this.existUserInTeam(obj._id,u._id);
        if(!bExist)
        {
            throw (e.userNotInTeam);
        }
        await teamGroup.findOneAndUpdate({
            team:id,
            "users.user":objTeam.owner
        },{
            "users.$.role":0
        })
        await teamGroup.findOneAndUpdate({
            team:id,
            "users.user":u._id
        },{
            "users.$.role":2
        })
        objTeam.owner=u._id;
        await objTeam.save();
        return u;
    }
    async userQuitProject (id,userId){
        let userInfo=await user.findOne({
            _id:userId
        })
        if(!userInfo)
        {
            throw (e.userNotFound);
        }
        let obj=await project.findOne({
            _id:id
        });
        if(obj.owner.toString()==id)
        {
            throw (e.userForbidden);
        }
        let index=-1;
        for(let i=0;i< obj.users.length;i++)
        {
            let u=<ProjectUsersModel>(obj.users[i]);
            if(u.user.toString()==userInfo._id.toString())
            {
                index=i;
                break;
            }
        }
        if(index==-1)
        {
            throw (e.projectNotFound);
        }
        else
        {
            obj.users.splice(index,1);
            await obj.save();
        }
    }
    async userQuitTeam (id,userId){
        let obj=await team.findOne({
            _id:id
        })
        if(!obj)
        {
            throw (e.teamNotFound);
            return;
        }
        let objTeam=obj;
        let arr=await project.find({
            team:objTeam._id,
            owner:userId
        })
        if(arr.length>0)
        {
            throw (e.userInProject);
            return;
        }
        await project.update({
            team:objTeam._id,
            "users.user":userId
        },{
            $pull:{
                users:{
                    user:userId
                }
            }
        }, {
            multi: true
        });
        await teamGroup.update({
            team:objTeam._id
        },{
            "$pull":{
                "users":{
                    user:userId
                }
            }
        },{
            multi:true
        });
    }
    async addProject (name,dis,owner,isPublic,users,category){
        let update:any={
            name:name
        };
        if(dis)
        {
            update.dis=dis;
        }
        update.owner=owner;
        if(users)
        {
            let users1=JSON.parse(users);
            update.users=users1;
        }
        if(category==0)
        {
            if(isPublic)
            {
                update.public=isPublic;
            }
            let obj=await project.create(update);
            let query:any={
                name:"未命名",
                project:obj._id,
                id:uuid()
            }
            await group.create(query)
            query={
                name:"#回收站",
                project:obj._id,
                type:1,
                id:uuid()
            }
            await group.create(query)
        }
        else if(category==1)
        {
            await docProject.create(update);
        }
        else if(category==2)
        {
            await testProject.create(update);
        }
    }
    async setProjectUser (id,users,category){
        let model;
        if(category==0)
        {
            model=project;
        }
        else if(category==1)
        {
            model=docProject;
        }
        else if(category==2)
        {
            model=testProject;
        }
        let obj=await model.findOne({
            _id:id
        })
        if(!obj)
        {
            throw (e.projectNotFound);
            return;
        }
        let objProject=obj;
        let objUser=JSON.parse(users);
        for(let obj of objUser)
        {
            if(obj.user==objProject.owner.toString())
            {
                throw (e.userForbidden);
            }
            else if(objProject.team)
            {
                let bExist=await this.existUserInTeam(objProject.team,obj.user);
                if(!bExist)
                {
                    throw (e.userNotInTeam);
                }
            }
        }
        objProject.users=objUser;
        await objProject.save();
    }
    async addTeam (owner,name,dis,users){
        let u=await user.findOne({
            _id:owner
        })
        if(!u)
        {
            throw (e.userNotFound);
        }
        let obj=await team.create({
            name:name,
            dis:dis,
            owner:owner
        });
        let objGroup=await teamGroup.create({
            name:"未命名",
            team:obj._id,
            users:[
                {
                    user:owner,
                    role:2
                }
            ]
        })
        if(users)
        {
            let users1=JSON.parse(users);
            for(let obj of users1)
            {
                objGroup.users.push(obj);
            }
            await teamGroup.update({
                _id:objGroup._id
            },{
                users:objGroup.users
            })
        }
    }
    async addTamGroup (id,groupId,name){
        let obj:InstanceType<TeamGroupModel>;
        if(groupId)
        {
            obj=await teamGroup.findOneAndUpdate({
                _id:groupId
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
        return obj;
    }
    async addTeamUser (id,username,groupId,role){
        let u=await user.findOne({
            name:username
        })
        if(!u)
        {
            throw (e.userNotFound);
        }
        if(await this.existUserInTeam(id,u._id))
        {
            throw (e.userAlreadyInTeam);
        }
        else
        {
            await teamGroup.findOneAndUpdate({
                _id:groupId
            },{
                $addToSet:{
                    users:{
                        user:u._id,
                        role:role
                    }
                }
            })
        }
        return u;
    }
    async removeTeamGroup (groupId){
        let obj=await teamGroup.findOne({
            _id:groupId
        });
        if(!obj)
        {
            throw (e.groupNotFound);
        }
        else if(obj.users.length>0)
        {
            throw (e.teamGroupNotEmpty);
        }
        await obj.remove();
    }
    async removeTeamUser (id,userId){
        let arr=await project.find({
            team:id,
            owner:userId
        })
        if(arr.length>0)
        {
            throw (e.userInProject);
            return;
        }
        await project.update({
            team:id,
            "users.user":userId
        },{
            $pull:{
                users:{
                    user:userId
                }
            }
        },{
            multi:true
        })
        await teamGroup.update({
            team:id
        },{
            "$pull":{
                "users":{
                    user:userId
                }
            }
        },{
            multi:true
        });
    }
    async pullTeamProject (id,projectId,category){
        let model;
        if(category==0)
        {
            model=project;
        }
        else if(category==1)
        {
            model=docProject;
        }
        else if(category==2)
        {
            model=testProject;
        }
        let objProject:InstanceType<DocProjectModel>|InstanceType<ProjectModel>|InstanceType<TestProjectModel>=await model.findOne({
            _id:projectId
        },"",{
            populate:{
                path:"owner",
                select:"name"
            }
        })
        if(!objProject)
        {
            throw (e.projectNotFound);
            return;
        }
        let objTeam=await team.findOne({
            _id:id
        })
        if(!objTeam)
        {
            throw (e.projectNotFound);
            return;
        }
        let arrTeamUser=await this.teamUserList(objTeam._id);
        let arrProjectUser:string[]
        if(this.isInstanceProjectType(objProject)) {
            arrProjectUser=objProject.users.map(function (obj:ProjectUsersModel) {
                return obj.user.toString();
            });
        }
        else
        {
            arrProjectUser=objProject.users.map(function (obj:mongoose.Schema.Types.ObjectId) {
                return obj.toString();
            });
        }
        arrProjectUser.push((objProject.owner as UserModel)._id.toString());
        let arr=[];
        for(let o of arrProjectUser)
        {
            if(arrTeamUser.indexOf(o)==-1)
            {
                arr.push(o);
            }
        }
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
                team:objTeam._id
            },{
                name:"未命名",
                team:objTeam._id,
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
        objProject.team=objTeam._id;
        await (objProject as mongoose.Document).save();
        objProject._doc.userCount=objProject.users.length+1;
        delete objProject._doc.users;
        if(category==0)
        {
            objProject._doc.interfaceCount=await interfaceModel.count({
                project:objProject._id
            })
        }
        else if(category==1)
        {
            objProject._doc.docCount=await doc.count({
                project:objProject._id
            })
        }
        else if(category==2)
        {
            objProject._doc.testCount=await test.count({
                project:objProject._id
            })
        }
        return objProject;
    }
    async pushTeamProject (id,projectId,category){
        let model;
        if(category==0)
        {
            model=project;
        }
        else if(category==1)
        {
            model=docProject;
        }
        else if(category==2)
        {
            model=testProject;
        }
        let obj=await model.findOneAndUpdate({
            _id:projectId,
            team:id
        },{
            $unset:{
                team:null
            }
        })
    }
    async setTeamUserRole (id,userId,role){
        let objTeam=await team.findOne({
            _id:id
        })
        if(!objTeam)
        {
            throw (e.projectNotFound);
            return;
        }
        await teamGroup.update({
            team:objTeam._id,
            "users.user":userId
        },{
            "users.$.role":role
        })
    }
    async setProjectUserRole (id,userId,role,option,category){
        let model;
        if(category==0)
        {
            model=project;
        }
        else if(category==1)
        {
            model=docProject;
        }
        else if(category==2)
        {
            model=testProject;
        }
        let objProject:InstanceType<ProjectModel>|InstanceType<DocProjectModel>|InstanceType<TestProjectModel>=await model.findOne({
            _id:id
        })
        if(!model)
        {
            throw (e.projectNotFound);
            return;
        }
        let u=await user.findOne({
            [objectId.isValid(userId)?"_id":"name"]:userId
        });
        if(!u)
        {
            throw (e.userNotFound);
            return;
        }
        if(objProject.owner.toString()==u._id.toString())
        {
            throw (e.systemReason);
            return;
        }
        if(category==0)
        {
            let bIn=false;
            for(let obj of objProject.users)
            {
                if((obj as ProjectUsersModel).user.toString()==u._id.toString())
                {
                    bIn=true;
                    break;
                }
            }
            if(bIn)
            {
                let update={
                    "users.$.role":role
                }
                if(option)
                {
                    update["users.$.option"]=JSON.parse(option);
                }
                else
                {
                    update["$unset"]={
                        "users.$.option":1
                    }

                }
                await model.findOneAndUpdate({
                    _id:id,
                    "users.user":u._id
                },update)
            }
            else
            {
                let update:any={
                    user:u._id,
                    role:role
                }
                if(option)
                {
                    update.option=JSON.parse(option);
                }
                await model.findOneAndUpdate({
                    _id:id
                },{
                    $addToSet:{
                        users:update
                    }
                })
                if(objProject.team)
                {
                    let bExist=await this.existUserInTeam(objProject.team,u._id);
                    if(!bExist)
                    {
                        let objGroup=await teamGroup.findOneAndUpdate({
                            name:"未命名",
                            team:objProject.team
                        },{
                            name:"未命名",
                            team:objProject.team,
                            $addToSet:{
                                users:{
                                    user:u._id,
                                    role:0
                                }
                            }
                        },{
                            upsert:true,
                            setDefaultsOnInsert:true
                        })
                    }
                }
                let ret=<{
                    user:InstanceType<UserModel>,
                    role:any,
                    option?:any
                }>{
                    user:u,
                    role:role,
                };
                if(option)
                {
                    ret.option=JSON.parse(option)
                }
                return ret;
            }
        }
        else
        {
            await model.update({
                _id:id
            },{
                $addToSet:{
                    users:u._id
                }
            },{
                new:true
            })
            return {
                user:u
            };
        }
    }
    async removeProjectUser (id,userId,category){
        let model;
        if(category==0)
        {
            model=project;
        }
        else if(category==1)
        {
            model=docProject;
        }
        else if(category==2)
        {
            model=testProject;
        }
        let objProject=await model.findOne({
            _id:id
        })
        if(!objProject)
        {
            throw (e.projectNotFound);
            return;
        }
        await model.findOneAndUpdate({
            _id:id
        },{
            $pull:{
                users:{
                    user:userId
                }
            }
        })
    }
    async searchUser (username){
        let reg=new RegExp("^"+username,"i");
        let arr=await user.find({
            name:reg
        },"name",{
            sort:"name",
            limit:20
        })
        return arr;
    }
    async projectUserList (id,category){
        let model;
        if(category==0)
        {
            model=project;
        }
        else if(category==1)
        {
            model=docProject;
        }
        else if(category==2)
        {
            model=testProject;
        }
        let objProject:InstanceType<ProjectModel>|InstanceType<DocProjectModel>|InstanceType<TestProjectModel>=await model.findOne({
            _id:id
        },null,{
            populate:{
                path:(category==0)?"users.user":"users",
                select:"name photo"
            }
        })
        if(!objProject)
        {
            throw (e.projectNotFound);
        }
        return objProject;
    }
    async editTeam (id,name,dis){
        let objTeam=await team.findOne({
            _id:id
        })
        if(!objTeam)
        {
            throw (e.projectNotFound);
            return;
        }
        objTeam.name=name;
        if(dis!==undefined)
        {
            objTeam.dis=dis
        }
        await objTeam.save();
        return objTeam;
    }
    async moveTeamUser (id,userId,groupId){
        let obj=await teamGroup.findOneAndUpdate({
            team:id,
            "users.user":userId
        },{
            $pull:{
                "users":{
                    user:userId
                }
            }
        });
        if(!obj)
        {
            throw (e.userNotInTeam);
        }
        let role;
        for(let o of obj.users)
        {
            if(o.user.toString()==userId)
            {
                role=o.role;
                break;
            }
        }
        let update={
            user:userId,
            role:role
        };
        obj=await teamGroup.findOneAndUpdate({
            _id:groupId
        },{
            $addToSet:{
                users:update
            }
        });
        if(!obj)
        {
            throw (e.groupNotFound);
        }
        update.user=await user.findOne({
            _id:update.user
        },"name photo")
        return update;
    }
    async getTeamUserList (id){
        let arrUser=await teamGroup.find({
            team:id
        },"",{
            populate:{
                path:"users.user",
                select:"name photo"
            }
        })
        let arr=<{
            _id:string,
            name:string,
            users:TeamGroupUsersModel[]
        }[]>[];
        arrUser.forEach(function (obj) {
            arr.push({
                users:obj.users,
                _id:obj._id,
                name:obj.name
            })
        })
        return arr;
    }
    async teamProjectList (id){
        let arr=await project.find({
            team:id
        },null,{
            populate:{
                path:"owner",
                select:"name"
            },
            sort:"name"
        })
        for(let obj of arr)
        {
            obj._doc.userCount=obj.users.length+1;
            delete obj._doc.users;
            obj._doc.interfaceCount=await interfaceModel.count({
                project:obj._id
            })
        }
        return arr;
    }
    async statisticList (start,end){
        let arr=await statistic.find({
            date:{
                $gte:start,
                $lte:end
            }
        },null,{
            sort:"-date"
        })
        return arr;
    }
    async getSetting (){
        let ret=<{
            info:{
                version:string,
                register:number
            },
            connect:{
                db:string,
                filePath:string,
                port:number,
            },
            files:string[],
            db:any
        }>{};
        let objInfo=await info.findOne();
        ret.info={
            version:objInfo.version,
            register:objInfo.register
        }
        ret.connect={
            db:config.db,
            filePath:config.filePath,
            port:config.port
        };
        ret.db=objInfo.dbName;
        ret.files=[];
        if(objInfo.dbName.backPath)
        {
            ret.files=await fs.readdir(objInfo.dbName.backPath)
            ret.files=ret.files.filter(function (obj) {
                if(obj.indexOf("@")>-1)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            })
            ret.files.sort(function (obj1,obj2) {
                if(obj1>obj2)
                {
                    return -1
                }
                else if(obj1<obj2)
                {
                    return 1
                }
                else
                {
                    return 0;
                }
            })
            ret.files=ret.files.slice(0,10);
        }
        return ret;
    }
    async setBasicInfo (register){
        let obj=await info.findOne();
        obj.register=register;
        await obj.save();
    }
    async backup (dbpath,backpath,hours,host,name,userId,pass,authdb,immediate){
        let obj=await info.findOne();
        // @ts-ignore
        obj.dbName={
            dbPath:dbpath,
            backPath:backpath,
            hours:JSON.parse(hours),
            host:host,
            name:name
        }
        if(userId)
        {
            obj.dbName.user=userId;
            obj.dbName.pass=pass;
            obj.dbName.authDb=authdb;
        }
        await obj.save();
        if(immediate)
        {
            await util.backup(obj.dbName,obj.version)
        }
    }
    async restore (id){
        let obj=await info.findOne();
        await util.restore(obj.db,id)
    }
    async backupList (page){
        let ret:string[]=[];
        let objInfo=await info.findOne();
        if(objInfo.dbName.backPath)
        {
            ret=await fs.readdir(objInfo.dbName.backPath)
            ret=ret.filter(function (obj) {
                if(obj.indexOf("@")>-1)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            })
            ret.sort(function (obj1,obj2) {
                if(obj1>obj2)
                {
                    return -1
                }
                else if(obj1<obj2)
                {
                    return 1
                }
                else
                {
                    return 0;
                }
            })
            ret=ret.slice(page*10,10);
        }
        return ret;
    }
    async removeBackup (id){
        let objInfo=await info.findOne();
        let backPath=path.join(objInfo.dbName.backPath,id);
        if(fs.existsSync(backPath))
        {
            util.removeFolder(backPath);
        }
    }
}
export=new AdminDao();
