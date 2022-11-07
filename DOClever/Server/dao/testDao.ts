/**
 * Created by sunxin on 2017/4/25.
 */


import e=require("../util/error.json");
import util=require("../util/util");
import userModel=require("../model/userModel")
import project=require("../model/projectModel")
import group=require("../model/groupModel")
import interfaceModel=require("../model/interfaceModel")
import status=require("../model/statusModel")
import statusVersion=require("../model/statusVersionModel")
import test=require("../model/testModel")
import testModule=require("../model/testModuleModel")
import testGroup=require("../model/testGroupModel")
import testProject=require("../model/testProjectModel")
import testCollection=require("../model/testCollectionModel")
import version=require("../model/versionModel")
import apply=require("../model/applyModel")
import team=require("../model/teamModel")
import teamGroup=require("../model/teamGroupModel")
import message=require("../model/messageModel")
import groupVersion=require("../model/groupVersionModel")
import interfaceVersion=require("../model/interfaceVersionModel")
import poll=require("../model/pollModel")
import jsdom = require("jsdom")
var dom=jsdom.JSDOM;
var window=(new dom(`...`)).window;
var document=window.document;
import uuid=require("uuid");
import {
    InterfaceModel, InterfaceVersionModel, ProjectModel, StatusModel, StatusVersionModel,
    TestCollectionModel,
    TestGroupModel, TestModel,
    TestModuleModel,
    TestProjectModel,
    UserModel, VersionModel
} from "../model/types";
import {keys} from "../../Common/transform";
import {ITestValidateUserRet} from "./types";
import {InstanceType} from "typegoose";
class TestDao {
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

    async validateUser (id?:string,project?:string,module?:string,group?:string){
        let ret=<ITestValidateUserRet>{}
        ret.moduleModel=testModule;
        ret.groupModel=testGroup;
        ret.testModel=test;
        if(id)
        {
            ret.objTest=await ret.testModel.findOne(id.length==24?{
                _id:id
            }:{
                id:id,
                project:project
            },null,{
                populate:{
                    path:"owner",
                    select:"name"
                }
            })
            if(!ret.objTest)
            {
                throw e.testNotFound;
            }
            ret.objTest=await ret.testModel.populate(ret.objTest,{
                path:"editor",
                select:"name"
            })
        }
        if(project)
        {
            ret.objProject=await testProject.findOne({
                _id:project
            })
            if(!ret.objProject)
            {
                throw e.projectNotFound;
            }
        }
        if(module)
        {
            ret.objModule=await ret.moduleModel.findOne({
                _id:module
            })
            if(!ret.objModule)
            {
                throw e.testModuleNotFound;
            }
        }
        if(group)
        {
            ret.objGroup=await ret.groupModel.findOne({
                _id:group
            })
            if(!ret.objGroup)
            {
                throw e.testGroupNotFound;
            }
        }
        return ret;

    }

    async save (id:string,user:string,p:any,group:string,userId:string){
        let objModel=await this.validateUser(id,null,null,group)
        let obj:any={},ret:InstanceType<TestModel>=null;
        for(let key in p)
        {
            if(key!="id" && p[key]!==undefined)
            {
                if(key=="ui")
                {
                    obj[key]=JSON.parse(p[key]);
                }
                else
                {
                    obj[key]=p[key];
                }
            }
        }
        let objModule=await objModel.moduleModel.findOne({
            _id:objModel.objGroup.module
        })
        if(!objModule)
        {
            throw e.testModuleNotFound;
            return;
        }
        else
        {
            obj.module=objModule._id;
        }
        let objProject=await testProject.findOne({
            _id:objModule.project
        })
        if(!objProject)
        {
            throw e.projectNotFound;
            return;
        }
        else
        {
            obj.project=objProject._id;
        }
        if(id)
        {
            obj.editor=userId;
            ret=await objModel.testModel.findOneAndUpdate({
                _id:id
            },obj,{
                new:true
            })
        }
        else
        {
            obj.owner=obj.editor=userId;
            obj.user=user;
            obj.id=uuid();
            ret=await objModel.testModel.create(obj);
        }
        ret=await objModel.testModel.populate(ret,{
            path:"module",
            select:"name"
        })
        ret=await objModel.testModel.populate(ret,{
            path:"group",
            select:"name"
        })
        return ret

    }


    async list (project:string,user:string,userId:string){
        let objModel=await this.validateUser(null,project,null,null)
        let obj=await testProject.findOne({
            _id:project
        },null,{
            populate:{
                path:"users",
                select:"name photo"
            }
        })
        if(!obj)
        {
            throw e.testProjectNotFound;
        }
        let query:any={
            project:project
        }
        let queryUser=null;
        if(user)
        {
            queryUser=query.user=user
        }
        else
        {
            let arr=[obj.owner.toString()].concat(obj.users.map(function (obj) {
                return (obj as UserModel)._id.toString();
            }));
            if(arr.indexOf(userId)>-1)
            {
                queryUser=query.user=userId;
            }
            else
            {
                queryUser=query.user=obj.owner;
            }
        }
        let arrModule=await objModel.moduleModel.find(query,null,{
            sort:"name"
        });
        for(let objModule of arrModule)
        {
            let query:any={
                module:objModule._id
            }
            query.user=queryUser;
            let arrGroup=await objModel.groupModel.find(query,null,{
                sort:"name"
            });
            for(let objGroup of arrGroup)
            {
                let query:any={
                    group:objGroup._id
                }
                query.user=queryUser;
                let arrTest=await objModel.testModel.find(query,"name id status group user module",{
                    sort:"name",
                    populate:[
                        {
                            path:"group",
                            select:"name"
                        },
                        {
                            path:"module",
                            select:"name"
                        }
                    ]
                })
                objGroup._doc.data=arrTest;
            }
            objModule._doc.data=arrGroup;
        }
        return arrModule

    }


    async info (project:string,only:number,user:string,userId:string){
        let objModel=await this.validateUser(null,project,null,null)
        let ret=<{
            info:InstanceType<TestProjectModel>,
            user:string,
            testList:InstanceType<TestModuleModel>[],
            collectionList:InstanceType<TestCollectionModel>[]
        }>{};
        let obj=await testProject.findOne({
            _id:project
        },null,{
            populate:{
                path:"users",
                select:"name photo"
            }
        })
        obj=await testProject.populate(obj,{
            path:"owner",
            select:"name photo"
        })
        if(only)
        {
            return obj
        }
        ret.info=obj;
        let query:any={
            project:project
        }
        let queryUser=null;
        let arr:any=[obj.owner.toString()].concat(obj.users.map(function (obj) {
            return (obj as UserModel)._id.toString();
        }));
        if(user)
        {
            queryUser=query.user=user
        }
        else
        {
            if(arr.indexOf(userId)>-1)
            {
                queryUser=query.user=userId;
            }
            else
            {
                queryUser=query.user=(obj.owner as UserModel)._id;
            }
        }
        if(arr.indexOf(userId)>-1)
        {
            ret.user=queryUser;
        }
        else
        {
            ret.user=(obj.owner as UserModel)._id.toString();
        }
        let arrModule=await objModel.moduleModel.find(query,null,{
            sort:"name"
        });
        for(let objModule of arrModule)
        {
            let query:any={
                module:objModule._id
            }
            query.user=queryUser;
            let arrGroup=await objModel.groupModel.find(query,null,{
                sort:"name"
            });
            for(let objGroup of arrGroup)
            {
                let query:any={
                    group:objGroup._id
                }
                query.user=queryUser;
                let arrTest=await objModel.testModel.find(query,"name id status group user module",{
                    sort:"name",
                    populate:{
                        path:"module",
                        select:"name"
                    }
                })
                arrTest=await objModel.testModel.populate(arrTest,{
                    path:"group",
                    select:"name"
                })
                objGroup._doc.data=arrTest;
            }
            objModule._doc.data=arrGroup;
        }
        ret.testList=arrModule;
        let arr1=await testCollection.find({
            project:project,
            user:queryUser
        },"name project user",{
            sort:"-createdAt"
        })
        ret.collectionList=arr1;
        return ret

    }


    async saveModule (module:string,name:string,project:string,user:string){
        let objModel=await this.validateUser(null,project,module,null)
        let obj:InstanceType<TestModuleModel>;
        if(module)
        {
            obj=await objModel.moduleModel.findOneAndUpdate({
                _id:module
            },{
                name:name
            },{
                new:true
            })
        }
        else
        {
            let query={
                name:name,
                project:project,
                id:uuid(),
                user:user
            }
            obj=await objModel.moduleModel.create(query)
            obj._doc.data=[];
        }
        return obj

    }

    async saveGroup (group:string,name:string,module:string,user:string,project:string){
        let objModel=await this.validateUser(null,project,module,group)
        let obj:InstanceType<TestGroupModel>;
        if(group)
        {
            obj=await objModel.groupModel.findOneAndUpdate({
                _id:group
            },{
                name:name
            },{
                new:true
            })
        }
        else
        {
            let query={
                name:name,
                module:module,
                id:uuid(),
                user:user,
                project:project
            }
            obj=await objModel.groupModel.create(query)
            obj._doc.data=[];
        }
        return obj

    }


    async removeModule (module:string){
        let objModel=await this.validateUser(null,null,module,null)
        let arrGroup=await objModel.groupModel.find({
            module:module
        });
        for(let objGroup of arrGroup)
        {
            let arrTest=await objModel.testModel.find({
                group:objGroup._id
            });
            for(let objTest of arrTest)
            {
                await objModel.testModel.remove({
                    _id:objTest._id
                })
            }
            await objModel.groupModel.remove({
                _id:objGroup._id
            })
        }
        await objModel.moduleModel.remove({
            _id:module
        })

    }


    async removeGroup (group:string){
        let objModel=await this.validateUser(null,null,null,group)
        let arrTest=await objModel.testModel.find({
            group:group
        });
        for(let objTest of arrTest)
        {
            await objModel.testModel.remove({
                _id:objTest._id
            })
        }
        await objModel.groupModel.remove({
            _id:group
        })

    }


    async removeTest (id:string){
        let objModel=await this.validateUser(id,null,null,null)
        await objModel.testModel.remove({
            _id:id
        })

    }


    async testInfo (id:string,type:string){
        let objModel=await this.validateUser(id,null,null,null)
        if(type=="code")
        {
            delete objModel.objTest._doc.ui;
            delete objModel.objTest._doc.output;
        }
        else if(type=="ui")
        {
            delete objModel.objTest._doc.code;
            delete objModel.objTest._doc.output;
        }
        return objModel.objTest

    }

    async setStatus (id:string,status:number,output:string){
        let objModel=await this.validateUser(id,null,null,null)
        objModel.objTest.status=status;
        if(output!==undefined)
        {
            objModel.objTest.output=output;
        }
        await objModel.objTest.save();

    }


    async setOutput (id:string,output:string){
        let objModel=await this.validateUser(id,null,null,null)
        objModel.objTest.output=output;
        await objModel.objTest.save();

    }


    async moveTest (id:string,group:string){
        let objModel=await this.validateUser(id,null,null,group)
        objModel.objTest.group=group as any;
        await objModel.objTest.save();

    }

    async projectList (userId:string){

        let ret=<{
            create:InstanceType<TestProjectModel>[],
            join:InstanceType<TestProjectModel>[]
        }>{};
        let arr=await testProject.find({
            owner:userId,
            team:{
                $exists:false
            }
        },null,{
            sort:"-createdAt"
        })
        for(let obj of arr)
        {
            obj._doc.userCount=obj.users.length+1;
            delete obj._doc.users;
            obj._doc.testCount=await test.count({
                project:obj._id
            })
            obj._doc.own=1;
            obj._doc.role=0;
        }
        ret.create=arr;
        arr=await testProject.find({
            users:userId,
            team:{
                $exists:false
            }
        },null,{
            sort:"-createdAt"
        })
        for(let obj of arr)
        {
            obj._doc.userCount=obj.users.length+1;
            delete obj._doc.users;
            obj._doc.testCount=await test.count({
                project:obj._id
            })
            obj._doc.own=0;
            obj._doc.role=0;
        }
        ret.join=arr;
        return ret

    }

    async saveProject (name:string,dis:string,team:string,project:string,userId:string){

        let query:any={
            name:name
        }
        if(dis)
        {
            query.dis=dis
        }
        if(team)
        {
            query.team=team
        }
        else
        {
            query["$unset"]={
                team:1
            }
        }
        let ret;
        if(project)
        {
            ret=await testProject.findOneAndUpdate({
                _id:project
            },query,{
                new:true
            })
        }
        else
        {
            query.owner=userId;
            ret=await testProject.create(query)
            ret._doc.userCount=1;
            ret._doc.testCount=0;
            ret._doc.own=1;
            ret._doc.role=0;
        }
        return ret

    }

    async removeProject (project:string){

        await test.remove({
            project:project
        })
        await testGroup.remove({
            project:project
        })
        await testModule.remove({
            project:project
        })
        await testProject.remove({
            _id:project
        })

    }

    async handleApply (applyId:string,project:string,state:number,userId:string){

        let obj=await apply.findOne({
            _id:applyId
        },null,{
            populate:{
                path:"from",
                select:"name"
            }
        });
        obj=await apply.populate(obj,{
            path:"to",
            select:"name"
        })
        if(!obj)
        {
            throw e.applyNotFound;
        }
        else if(obj.state!=0)
        {
            throw e.applyAlreadyHandle;
        }
        let objTeam=await team.findOne({
            _id:(<any>obj.from)._id
        })
        if(!objTeam)
        {
            throw e.teamNotFound;
        }
        obj.editor=userId as any;
        let objProject=await testProject.findOne({
            _id:project
        });
        if(!objProject)
        {
            throw e.testProjectNotFound;
        }
        if(objProject.team)
        {
            obj.state=3;
            await obj.save();
            if(objProject.team.toString()==(<any>obj.to)._id.toString())
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
                let arrTeamUser=await this.teamUserList(objTeam._id);
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
                await objProject.save();
            }
            await message.create({
                name:state==1?"您已同意测试项目加入团队":"您已拒绝测试项目加入团队",
                dis:`您已${state==1?"通过":"拒绝"}测试项目${objProject.name}加入团队${(<any>obj.from).name}`,
                user:userId,
                type:1
            })
            await obj.save();
            await apply.update({
                to:objProject._id,
                type:6,
                state:0
            },{
                state:3
            },{
                multi:true
            })
        }

    }

    async setOwner (project:string,user:string){

        let obj=await userModel.findOne({
            _id:user
        })
        if(!obj)
        {
            throw e.userNotFound;
            return;
        }
        let objProject=await testProject.findOne({
            _id:project
        })
        if(!objProject)
        {
            throw e.docProjectNotFound;
        }
        let bInTeam=false;
        if(objProject.team)
        {
            let bIn=await this.existUserInTeam(objProject.team.toString(),user);
            if(!bIn)
            {
                throw e.userNotInTeam;
            }
            else
            {
                bInTeam=true;
            }
        }
        let bFind=false;
        for(let o of objProject.users)
        {
            if(o.toString()==user)
            {
                bFind=true;
                break;
            }
        }
        if(bFind)
        {
            await testProject.update({
                _id:project
            },{
                owner:user,
                $pull:{
                    "users":user
                }
            })
        }
        else
        {
            if(bInTeam)
            {
                objProject.owner=user as any;
                await objProject.save();
            }
            else
            {
                throw e.userNotInProject;
            }
        }

    }

    async filterList (name:string,team:string,userId:string){

        let query:any={
            name:new RegExp(name,"i")
        }
        if(team)
        {
            query.team=team;
            query["$or"]=[
                {
                    owner:userId
                },
                {
                    users:userId
                }
            ]
        }
        else
        {
            query.team={
                $exists:false
            }
            query["$or"]=[
                {
                    owner:userId
                },
                {
                    users:userId
                }
            ]
        }
        let arr=await testProject.find(query,"_id name dis",{
            sort:"createdAt"
        });
        return arr

    }

    async addUser (project:string,user:string){

        let objUser=await userModel.findOne({
            name:user
        })
        if(!objUser)
        {
            throw e.userNotFound;
        }
        let objProject=await testProject.findOne({
            _id:project
        })
        if(!objProject)
        {
            throw e.testProjectNotFound;
        }
        for(let u of objProject.users)
        {
            if(u.toString()==objUser._id.toString())
            {
                throw e.userAlreadyInTest;
            }
        }
        if(objProject.team)
        {
            let bExist=await this.existUserInTeam(objProject.team.toString(),objUser._id)
            if(!bExist)
            {
                throw e.userNotInTeam;
            }
        }
        await testProject.findOneAndUpdate({
            _id:project
        },{
            $addToSet:{
                users:objUser._id
            }
        })
        return objUser

    }

    async removeUser (project:string,user:string){

        let objUser=await userModel.findOne({
            _id:user
        })
        if(!objUser)
        {
            throw e.userNotFound;
        }
        let objProject=await testProject.findOne({
            _id:project
        })
        if(!objProject)
        {
            throw e.testProjectNotFound;
        }
        let bExist=false;
        for(let u of objProject.users)
        {
            if(u.toString()==user)
            {
                bExist=true;
            }
        }
        if(!bExist)
        {
            throw e.userNotInTest;
        }
        await testProject.update({
            _id:project
        },{
            $pull:{
                users:user,
                "cooperation.user":user,
                "cooperation.users.user":user
            }
        });
        await test.remove({
            project:project,
            user:user
        })
        await testGroup.remove({
            project:project,
            user:user
        })
        await testModule.remove({
            project:project,
            user:user
        })
        await testCollection.remove({
            project:project,
            user:user
        })
        await poll.remove({
            project:project,
            owner:user
        })
        await poll.update({
            project:project
        },{
            $pull:{
                users:user
            }
        })

    }

    async quit (project:string,userId:string){

        let obj=await testProject.findOne({
            _id:project
        });
        if(obj.owner.toString()==userId)
        {
            throw e.userForbidden;
        }
        let index=-1;
        for(let i=0;i< obj.users.length;i++)
        {
            let u=obj.users[i];
            if(u.toString()==userId)
            {
                index=i;
                break;
            }
        }
        if(index==-1)
        {
            throw e.projectNotFound;
        }
        else
        {
            await testProject.update({
                _id:project
            },{
                $pull:{
                    users:userId,
                    "cooperation.user":userId,
                    "cooperation.users.user":userId
                }
            });
            await test.remove({
                project:project,
                user:userId
            })
            await testGroup.remove({
                project:project,
                user:userId
            })
            await testModule.remove({
                project:project,
                user:userId
            })
            await testCollection.remove({
                project:project,
                user:userId
            })
            await poll.remove({
                project:project,
                owner:userId
            })
            await poll.update({
                project:project
            },{
                $pull:{
                    users:userId
                }
            })
        }

    }

    async setUser (project:string,user:string){

        let obj=await testProject.findOne({
            _id:project
        });
        if(!obj)
        {
            throw e.testProjectNotFound;
        }
        obj.users=JSON.parse(user);
        await obj.save();

    }

    async interfaceList (userId:string){

        let ret=[];
        let arrTemp=await teamGroup.find({
            "users":{
                $elemMatch:{
                    user:userId,
                    role:{
                        $in:[0,2]
                    }
                }
            }
        },"team",{
            sort:"-createdAt",
            populate:{
                path:"team",
                select:"name"
            }
        })
        ret=arrTemp.map(function (obj) {
            let o:any=obj.team;
            o.access=1;
            return o;
        });
        arrTemp=await teamGroup.find({
            "users":{
                $elemMatch:{
                    user:userId,
                    role:1
                }
            }
        },"team",{
            sort:"-createdAt",
            populate:{
                path:"team",
                select:"name"
            }
        })
        ret=ret.concat(arrTemp.map(function (obj) {
            let o:any=obj.team;
            o.access=0;
            return o;
        }));
        ret.unshift({
            _id:"",
            name:"无团队",
            access:1
        });
        for(let objTeam of ret)
        {
            let query={},arrProject=[];
            if(objTeam._id)
            {
                let access=objTeam.access;
                delete objTeam.access;
                if(access)
                {
                    query={
                        team:objTeam._id,
                    }
                }
                else
                {
                    query={
                        team:objTeam._id,
                        $or:[
                            {
                                owner:userId
                            },
                            {
                                "users.user":userId
                            }
                        ]
                    }
                }
                arrProject=await project.find(query,"name",{
                    sort:"-createdAt"
                })
            }
            else
            {
                query={
                    team:{
                        $exists:false
                    },
                    $or:[
                        {
                            owner:userId
                        },
                        {
                            "users.user":userId
                        }
                    ]
                }
                arrProject=await project.find(query,"name",{
                    sort:"-createdAt"
                })
            }
            (objTeam._doc?objTeam._doc:objTeam).data=arrProject;
            for(let objPro of arrProject)
            {
                let arrVersion=[];
                arrVersion=await version.find({
                    project:objPro._id
                },"version",{
                    sort:"-createdAt"
                })
                arrVersion.forEach(function (obj) {
                    obj._doc.name=obj.version;
                    delete obj._doc.version
                })
                arrVersion.unshift({
                    _id:"",
                    name:"master",
                })
                if(objPro._doc)
                {
                    objPro._doc.data=arrVersion;
                }
                else
                {
                    objPro.data=arrVersion;
                }
                let curProjectID=objPro._id;
                for(let objVersion of arrVersion)
                {
                    let groupModel=group;
                    let interfaceCurModel=interfaceModel;
                    if(objVersion._id)
                    {
                        groupModel=groupVersion;
                        interfaceCurModel=interfaceVersion;
                    }
                    let getChild=async function(id,obj,bInter) {
                        let query:any={
                            project:id,
                            parent:obj?obj.id:{
                                $exists:false
                            }
                        }
                        if(objVersion._id)
                        {
                            query.version=objVersion._id
                        }
                        let arr=await groupModel.find(query,"name id",{
                            sort:"name"
                        })
                        for(let obj of arr)
                        {
                            obj._doc.data=await getChild(id,obj,bInter);
                            delete obj._doc.id;
                        }
                        if(bInter && obj)
                        {
                            let arrInterface=await interfaceCurModel.find({
                                group:obj._id
                            },"name",{
                                sort:"name"
                            });
                            // @ts-ignore
                            arr=arr.concat(arrInterface);
                        }
                        return arr;
                    }
                    let arr=await getChild(curProjectID,null,1);
                    (objVersion._doc?objVersion._doc:objVersion).data=arr;
                }
            }
        }
        return ret

    }

    async interfaceInfo (interfaceId:string,only:number){

        let ret=<{
            interface:InstanceType<InterfaceModel>|InstanceType<InterfaceVersionModel>,
            baseUrls:any[],
            status:InstanceType<StatusModel>[]|InstanceType<StatusVersionModel>[]
        }>{};
        let interfaceCurModel:typeof interfaceModel|typeof interfaceVersion=interfaceModel;
        let statusCurModel:typeof status|typeof statusVersion=status;
        let obj=await interfaceModel.findOne(interfaceId.length==24?{
            _id:interfaceId
        }:{
            id:interfaceId
        });
        if(!obj)
        {
            interfaceCurModel=interfaceVersion;
            statusCurModel=statusVersion;
            obj=await interfaceVersion.findOne({
                _id:interfaceId
            });
            if(!obj)
            {
                throw e.interfaceNotFound;
            }
        }
        if(only)
        {
            return obj
        }
        let objInterface:InstanceType<InterfaceModel>|InstanceType<InterfaceVersionModel>=obj;
        objInterface = await interfaceCurModel.populate(objInterface, {
            path: "project",
            select: "name"
        })
        if (objInterface.group) {
            objInterface = await interfaceCurModel.populate(objInterface, {
                path: "group",
                select: "name"
            })
        }
        if (objInterface.owner) {
            objInterface = await interfaceCurModel.populate(objInterface, {
                path: "owner",
                select: "name"
            })
        }
        if (objInterface.editor) {
            objInterface = await interfaceCurModel.populate(objInterface, {
                path: "editor",
                select: "name"
            })
        }
        ret.interface=objInterface;
        let arrBaseUrl=[];
        if((objInterface as InstanceType<InterfaceVersionModel>).version)
        {
            let obj=await version.findOne({
                _id:(objInterface as InstanceType<InterfaceVersionModel>).version
            })
            if(!obj)
            {
                throw e.versionNotFound;
            }
            arrBaseUrl=obj.baseUrls;
        }
        else
        {
            let obj=await project.findOne({
                _id:objInterface.project
            })
            if(!obj)
            {
                throw e.projectNotFound;
            }
            arrBaseUrl=obj.baseUrls;
        }
        ret.baseUrls=arrBaseUrl;
        let query:any={
            project:objInterface.project
        }
        if((objInterface as InstanceType<InterfaceVersionModel>).version)
        {
            query.version=(objInterface as InstanceType<InterfaceVersionModel>).version;
        }
        let arrStatus=await statusCurModel.find(query);
        ret.status=arrStatus;
        return ret

    }

    async urlList (projectId:string,user:string,urls:string){

        let arr=await test.find({
            project:projectId,
            user:user
        });
        let arrProject=urls?urls.split(","):[];
        for(let obj of arr)
        {
            if(obj.code)
            {
                let div=document.createElement("div");
                div.innerHTML=obj.code;
                let arrLink=div.querySelectorAll("a[data]");
                arrLink.forEach(function (obj) {
                    let data=obj.getAttribute("data");
                    let type=obj.getAttribute("type");
                    if(type!=1)
                    {
                        return;
                    }
                    let o=JSON.parse(data);
                    if(o.project && o.project._id && arrProject.indexOf(o.project._id)==-1)
                    {
                        arrProject.push(o.project._id);
                    }
                })
                div.innerHTML="";
            }
            if(obj.ui.length>0)
            {
                obj.ui.forEach(function (obj) {
                    if(obj.type=="interface")
                    {
                        let o=JSON.parse(obj.data);
                        if(o.project && o.project._id && arrProject.indexOf(o.project._id)==-1)
                        {
                            arrProject.push(o.project._id);
                        }
                    }
                })
            }
        }
        let arrProject1=await project.find({
            _id:{
                $in:arrProject
            }
        },"baseUrls name");
        let ret=arrProject1.map(function (obj) {
            return {
                _id:obj._id,
                name:obj.name,
                data:obj.baseUrls.map(function (obj) {
                    return {
                        _id:obj.url,
                        name:obj.url,
                        env:obj.env
                    }
                })
            }
        })
        return ret
    }

    async interfaceProject (projectId:string,versionId:string){

        let objProject:InstanceType<ProjectModel> | InstanceType<VersionModel>=await project.findOne({
            _id:projectId
        },"baseUrls after before");
        if(!objProject)
        {
            throw e.projectNotFound;
        }
        if(versionId)
        {
            let objVersion=await version.findOne({
                _id:versionId
            },"baseUrls after before");
            if(!objVersion)
            {
                throw e.versionNotFound;
            }
            objProject=objVersion;
        }
        return objProject

    }

    async saveCollection (collection:string,project:string,user:string,name:string,test:string,output:string){

        let obj:InstanceType<TestCollectionModel>;
        if(collection)
        {
            let update:any={
                name:name
            };
            if(test)
            {
                update.tests=JSON.parse(test);
            }
            if(output)
            {
                update.output=JSON.parse(output);
            }
            obj=await testCollection.findOneAndUpdate({
                _id:collection
            },update,{
                new:true
            })
        }
        else
        {
            obj=await testCollection.create({
                name:name,
                project:project,
                user:user
            })
        }
        return obj

    }

    async collectionList (project:string,user:string,userId:string){

        let arr=await testCollection.find({
            project:project,
            user:user?user:userId
        },"name project user",{
            sort:"-createdAt"
        });
        return arr

    }

    async collectionInfo (collection:string){

        let obj=await testCollection.findOne({
            _id:collection
        },"",{
            populate:{
                path:"tests.test",
                populate:[
                    {
                        path:"module",
                        select:"name"
                    },
                    {
                        path:"group",
                        select:"name"
                    }
                ]
            }
        });
        obj._doc.tests=obj._doc.tests.filter(function (obj) {
            if(obj.test)
            {
                return true
            }
            else
            {
                return false;
            }
        })
        if(!obj)
        {
            throw e.testCollectionNotFound;
        }
        return obj

    }

    async removeCollection (collection:string){

        let obj=await testCollection.findOne({
            _id:collection
        });
        if(!obj)
        {
            throw e.testCollectionNotFound;
        }
        if(obj.poll)
        {
            await poll.remove({
                _id:obj.poll
            })
        }
        await obj.remove();

    }

    async getUsers (project:string){

        let objProject=await testProject.findOne({
            _id:project
        },null,{
            populate:[
                {
                    path:"owner",
                    select:"name photo"
                },
                {
                    path:"users",
                    select:"name photo"
                }
            ]
        })
        if(!objProject)
        {
            throw e.testProjectNotFound;
        }
        let arr=[objProject.owner].concat(objProject.users);
        return arr

    }

    async cooperationInfo (project:string,userId:string){

        let obj=await testProject.findOne({
            _id:project
        });
        if(!obj)
        {
            throw e.testProjectNotFound;
        }
        let arr=[];
        obj.cooperation.forEach(function (obj) {
            if(obj.user.toString()==userId)
            {
                arr=obj.users;
            }
        })
        return arr

    }

    async editCooperation (project:string,users:string,userId:string){

        let obj=await testProject.findOne({
            _id:project
        });
        if(!obj)
        {
            throw e.testProjectNotFound;
        }
        let objSel;
        obj.cooperation.forEach(function (obj) {
            if(obj.user.toString()==userId)
            {
                objSel=obj;
            }
        })
        if(objSel)
        {
            objSel.users=JSON.parse(users);
        }
        else
        {
            obj.cooperation.push({
                user:userId as any,
                users:JSON.parse(users)
            })
        }
        await obj.save();

    }

    async getAllGroupList (userId:string){

        let arr=await testProject.find({
            $or:[
                {
                    owner:userId
                },
                {
                    users:userId
                }
            ]
        },"name")
        for(let objProject of arr)
        {
            objProject._doc.children=await testModule.find({
                user:userId,
                project:objProject._id
            },"name")
            for(let objModule of objProject._doc.children)
            {
                objModule._doc.children=await testGroup.find({
                    module:objModule._id
                },"name")
            }
        }
        return arr

    }

    async getAllList (userId:string){

        let arr=await testProject.find({
            $or:[
                {
                    owner:userId
                },
                {
                    users:userId
                }
            ]
        },"name")
        for(let objProject of arr)
        {
            objProject._doc.children=await testModule.find({
                user:userId,
                project:objProject._id
            },"name")
            for(let objModule of objProject._doc.children)
            {
                objModule._doc.children=await testGroup.find({
                    module:objModule._id
                },"name")
                for(let objGroup of objModule._doc.children)
                {
                    objGroup._doc.children=await test.find({
                        group:objGroup._id
                    },"name")
                }
            }
        }
        return arr

    }

    async exportProject (project:string,userId:string){

        let objProject=await testProject.findOne({
            _id:project
        },"-_id name dis")
        if(!objProject)
        {
            throw e.testProjectNotFound;
        }
        objProject._doc.flag="DOClever";
        objProject._doc.type="testProject";
        objProject._doc.module=[];
        let arrModule=await testModule.find({
            project:project,
            user:userId
        },"name")
        for(let objModule of arrModule)
        {
            let id=objModule._id;
            delete objModule._doc._id;
            objModule._doc.group=[];
            let arrGroup=await testGroup.find({
                module:id,
                user:userId
            },"name")
            for(let objGroup of arrGroup)
            {
                let id=objGroup._id;
                delete objGroup._doc._id;
                objGroup._doc.test=[];
                let arrTest=await test.find({
                    group:id,
                    user:userId
                },"-project -module -group -owner -editor -user");
                objGroup._doc.test=arrTest;
            }
            objModule._doc.group=arrGroup;
        }
        objProject._doc.module=arrModule;
        let arrCollection=await testCollection.find({
            project:project,
            user:userId
        },"name project tests output");
        objProject._doc.collection=arrCollection;
        let content=JSON.stringify(objProject);
        let headers:any={
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename*=UTF-8\'\''+encodeURIComponent(objProject.name)+".json",
            "Transfer-Encoding": "chunked",
            "Expires":0,
            "Cache-Control":"must-revalidate, post-check=0, pre-check=0",
            "Content-Transfer-Encoding":"binary",
            "Pragma":"public",
        }
        return {headers,content}

    }

    async importProject (content:string,project:string,userId:string){

        let obj=JSON.parse(content);
        if(obj.flag!="DOClever" || obj.type!="testProject")
        {
            throw e.systemReason;
        }
        let objProject;
        if(project)
        {
            objProject=await testProject.findOne({
                _id:project
            });
            if(!objProject)
            {
                throw e.testProjectNotFound;
            }
        }
        else
        {
            let query:any={
                name:obj.name,
                owner:userId
            }
            if(obj.dis)
            {
                query.dis=obj.dis;
            }
            if(obj.team)
            {
                query.team=obj.team;
            }
            objProject=await testProject.create(query)
        }
        let objTest_Id={},objTestId={},arrTest=[],count=0;
        for(let objRawModule of obj.module)
        {
            let query:any={
                name:objRawModule.name,
                project:objProject._id,
                user:userId
            }
            let objModule=await testModule.findOne(query);
            if(!objModule)
            {
                query.id=uuid();
                objModule=await testModule.create(query);
            }
            for(let objRawGroup of objRawModule.group)
            {
                let query:any={
                    name:objRawGroup.name,
                    module:objModule._id,
                    project:objProject._id,
                    user:userId
                }
                let objGroup=await testGroup.findOne(query);
                if(!objGroup)
                {
                    query.id=uuid();
                    objGroup=await testGroup.create(query);
                }
                for(let objRawTest of objRawGroup.test)
                {
                    let query={
                        name:objRawTest.name,
                        project:objProject._id,
                        module:objModule._id,
                        group:objGroup._id,
                        remark:objRawTest.remark?objRawTest.remark:"",
                        owner:userId,
                        editor:userId,
                        status:objRawTest.status,
                        code:objRawTest.code,
                        ui:objRawTest.ui,
                        output:objRawTest.output,
                        id:uuid(),
                        user:userId
                    }
                    let objTest=await test.create(query);
                    arrTest.push(objTest);
                    objTest_Id[objRawTest._id.toString()]=objTest._id;
                    objTestId[objRawTest.id]=objTest._id;
                    count++;
                }
            }
        }
        for(let o of obj.collection)
        {
            let arr=o.tests.map(function (obj) {
                obj.test=objTest_Id[obj.test.toString()];
                return obj;
            })
            let query={
                name:o.name,
                project:objProject._id,
                user:userId,
                tests:arr,
                output:o.output
            }
            let objCollection=await testCollection.create(query);
        }
        for(let o of arrTest)
        {
            let arrUI=o.ui;
            for(let i=0;i<arrUI.length;i++)
            {
                if(arrUI[i].type=="test")
                {
                    arrUI[i].data=objTest_Id[arrUI[i].data];
                }
            }
            let code="";
            if(o.code)
            {
                let ele=document.createElement("div");
                ele.innerHTML=o.code;
                let arrLink=ele.getElementsByTagName("a");
                for(let i=0;i<arrLink.length;i++)
                {
                    let objLink=arrLink[i];
                    let type=objLink.getAttribute("type")
                    if(type=="2")
                    {
                        let data=objLink.getAttribute("data");
                        if(data.length==24)
                        {
                            objLink.setAttribute("data",objTest_Id[data]);
                        }
                        else
                        {
                            objLink.setAttribute("data",objTestId[data]);
                        }
                    }
                }
                code=ele.innerHTML;
            }
            await test.update({
                _id:o._id
            },{
                ui:arrUI,
                code:code
            })
        }
        objProject._doc.role=0;
        objProject._doc.userCount=1;
        objProject._doc.testCount=count;
        objProject._doc.own=1;
        return objProject

    }

    async exportModule (module:string,userId:string){

        let objModule=await testModule.findOne({
            _id:module
        },"name")
        let id=objModule._id;
        delete objModule._doc._id;
        objModule._doc.flag="DOClever";
        objModule._doc.type="testModule";
        objModule._doc.group=[];
        let arrGroup=await testGroup.find({
            module:id,
            user:userId
        },"name")
        for(let objGroup of arrGroup)
        {
            let id=objGroup._id;
            delete objGroup._doc._id;
            objGroup._doc.test=[];
            let arrTest=await test.find({
                group:id,
                user:userId
            },"-project -module -group -owner -editor -user");
            objGroup._doc.test=arrTest;
        }
        objModule._doc.group=arrGroup;
        let content=JSON.stringify(objModule);
        let headers:any={
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename*=UTF-8\'\''+encodeURIComponent(objModule.name)+".json",
            "Transfer-Encoding": "chunked",
            "Expires":0,
            "Cache-Control":"must-revalidate, post-check=0, pre-check=0",
            "Content-Transfer-Encoding":"binary",
            "Pragma":"public",
        }
        return {headers,content}

    }

    async importModule (content:string,project:string,userId:string){

        let obj=JSON.parse(content);
        if(obj.flag!="DOClever" || obj.type!="testModule")
        {
            throw e.systemReason;
        }
        let objProject=await testProject.findOne({
            _id:project
        })
        if(!objProject)
        {
            throw e.testProjectNotFound;
        }
        let query:any={
            name:obj.name,
            project:objProject._id,
            user:userId
        }
        let objModule=await testModule.findOne(query);
        if(!objModule)
        {
            query.id=uuid();
            objModule=await testModule.create(query);
        }
        let objTest_Id={},objTestId={},arrTest=[];
        for(let objRawGroup of obj.group)
        {
            let query:any={
                name:objRawGroup.name,
                module:objModule._id,
                project:objProject._id,
                user:userId
            }
            let objGroup=await testGroup.findOne(query);
            if(!objGroup)
            {
                query.id=uuid();
                objGroup=await testGroup.create(query);
            }
            for(let objRawTest of objRawGroup.test)
            {
                let query={
                    name:objRawTest.name,
                    project:objProject._id,
                    module:objModule._id,
                    group:objGroup._id,
                    remark:objRawTest.remark?objRawTest.remark:"",
                    owner:userId,
                    editor:userId,
                    status:objRawTest.status,
                    code:objRawTest.code,
                    ui:objRawTest.ui,
                    output:objRawTest.output,
                    id:uuid(),
                    user:userId
                }
                let objTest=await test.create(query);
                arrTest.push(objTest);
                objTest_Id[objRawTest._id.toString()]=objTest._id;
                objTestId[objRawTest.id]=objTest._id;
            }
        }
        for(let o of arrTest)
        {
            let arrUI=o.ui;
            for(let i=0;i<arrUI.length;i++)
            {
                if(arrUI[i].type=="test")
                {
                    arrUI[i].data=objTest_Id[arrUI[i].data];
                }
            }
            let code="";
            if(o.code)
            {
                let ele=document.createElement("div");
                ele.innerHTML=o.code;
                let arrLink=ele.getElementsByTagName("a");
                for(let i=0;i<arrLink.length;i++)
                {
                    let objLink=arrLink[i];
                    let type=objLink.getAttribute("type")
                    if(type=="2")
                    {
                        let data=objLink.getAttribute("data");
                        if(data.length==24)
                        {
                            objLink.setAttribute("data",objTest_Id[data]);
                        }
                        else
                        {
                            objLink.setAttribute("data",objTestId[data]);
                        }
                    }
                }
                code=ele.innerHTML;
            }
            await test.update({
                _id:o._id
            },{
                ui:arrUI,
                code:code
            })
        }
        return objModule

    }

    async exportGroup (group:string,userId:string){

        let objGroup=await testGroup.findOne({
            _id:group
        },"name")
        let id=objGroup._id;
        delete objGroup._doc._id;
        objGroup._doc.flag="DOClever";
        objGroup._doc.type="testGroup";
        objGroup._doc.test=[];
        let arrTest=await test.find({
            group:id,
            user:userId
        },"-project -module -group -owner -editor -userModel");
        objGroup._doc.test=arrTest;
        let content=JSON.stringify(objGroup);
        let headers:any={
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename*=UTF-8\'\''+encodeURIComponent(objGroup.name)+".json",
            "Transfer-Encoding": "chunked",
            "Expires":0,
            "Cache-Control":"must-revalidate, post-check=0, pre-check=0",
            "Content-Transfer-Encoding":"binary",
            "Pragma":"public",
        }
        return {headers,content}

    }

    async importGroup (content:string,module:string,userId:string){

        let obj=JSON.parse(content);
        if(obj.flag!="DOClever" || obj.type!="testGroup")
        {
            throw e.systemReason;
        }
        let objModule=await testModule.findOne({
            _id:module
        })
        if(!objModule)
        {
            throw e.testModuleNotFound;
        }
        let query:any={
            name:obj.name,
            module:objModule._id,
            project:objModule.project,
            user:userId
        }
        let objGroup=await testGroup.findOne(query);
        if(!objGroup)
        {
            query.id=uuid();
            objGroup=await testGroup.create(query);
        }
        let objTest_Id={},objTestId={},arrTest=[];
        for(let objRawTest of obj.test)
        {
            let query={
                name:objRawTest.name,
                project:objModule.project,
                module:objModule._id,
                group:objGroup._id,
                remark:objRawTest.remark?objRawTest.remark:"",
                owner:userId,
                editor:userId,
                status:objRawTest.status,
                code:objRawTest.code,
                ui:objRawTest.ui,
                output:objRawTest.output,
                id:uuid(),
                user:userId
            }
            let objTest=await test.create(query);
            arrTest.push(objTest);
            objTest_Id[objRawTest._id.toString()]=objTest._id;
            objTestId[objRawTest.id]=objTest._id;
        }
        for(let o of arrTest)
        {
            let arrUI=o.ui;
            for(let i=0;i<arrUI.length;i++)
            {
                if(arrUI[i].type=="test")
                {
                    arrUI[i].data=objTest_Id[arrUI[i].data];
                }
            }
            let code="";
            if(o.code)
            {
                let ele=document.createElement("div");
                ele.innerHTML=o.code;
                let arrLink=ele.getElementsByTagName("a");
                for(let i=0;i<arrLink.length;i++)
                {
                    let objLink=arrLink[i];
                    let type=objLink.getAttribute("type")
                    if(type=="2")
                    {
                        let data=objLink.getAttribute("data");
                        if(data.length==24)
                        {
                            objLink.setAttribute("data",objTest_Id[data]);
                        }
                        else
                        {
                            objLink.setAttribute("data",objTestId[data]);
                        }
                    }
                }
                code=ele.innerHTML;
            }
            await test.update({
                _id:o._id
            },{
                ui:arrUI,
                code:code
            })
        }
        return objGroup

    }

    async exportTest (testId:string){

        let objTest=await test.findOne({
            _id:testId
        },"-project -module -group -owner -editor -userModel");
        objTest._doc.flag="DOClever";
        objTest._doc.type="testTest"
        let content=JSON.stringify(objTest);
        let headers:any={
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename*=UTF-8\'\''+encodeURIComponent(objTest.name)+".json",
            "Transfer-Encoding": "chunked",
            "Expires":0,
            "Cache-Control":"must-revalidate, post-check=0, pre-check=0",
            "Content-Transfer-Encoding":"binary",
            "Pragma":"public",
        }
        return {headers,content}

    }

    async importTest (content:string,group:string,userId:string){

        let obj=JSON.parse(content);
        if(obj.flag!="DOClever" || obj.type!="testTest")
        {
            throw e.systemReason;
        }
        let objGroup=await testGroup.findOne({
            _id:group
        })
        if(!objGroup)
        {
            throw e.testGroupNotFound;
        }
        let query={
            name:obj.name,
            project:objGroup.project,
            module:objGroup.module,
            group:objGroup._id,
            remark:obj.remark?obj.remark:"",
            owner:userId,
            editor:userId,
            status:obj.status,
            code:obj.code,
            ui:obj.ui,
            output:obj.output,
            id:uuid(),
            user:userId
        }
        let objTest=await test.create(query);
        return objTest

    }

    async pasteTest (testId:string,group:string,userId:string){

        let obj=await test.findOne({
            _id:testId
        });
        if(!obj)
        {
            throw e.testNotFound;
        }
        let objGroup=await testGroup.findOne({
            _id:group
        });
        if(!objGroup)
        {
            throw e.testGroupNotFound;
        }
        let query={
            name:obj.name+"(副本)",
            project:objGroup.project,
            module:objGroup.module,
            group:objGroup._id,
            remark:obj.remark?obj.remark:"",
            owner:userId,
            editor:userId,
            status:obj.status,
            code:obj.code,
            ui:obj.ui,
            output:obj.output,
            id:uuid(),
            user:userId
        }
        let objTest=await test.create(query);
        return objTest

    }
}

export=new TestDao;



