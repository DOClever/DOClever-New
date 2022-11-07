/**
 * Created by sunxin on 2016/11/16.
 */


import e=require("../util/error.json");
import util=require("../util/util");
import con=require("../../config.json");
import userModel=require("../model/userModel")
import project=require("../model/projectModel")
import group=require("../model/groupModel")
import groupVersion=require("../model/groupVersionModel")
import interfaceVersion=require("../model/interfaceVersionModel")
import interfaceSnapshot=require("../model/interfaceSnapshotModel")
import statusVersion=require("../model/statusVersionModel")
import interfaceModel=require("../model/interfaceModel")
import status=require("../model/statusModel")
import temp=require("../model/tempModel")
import team=require("../model/teamModel")
import teamGroup=require("../model/teamGroupModel")
import apply=require("../model/applyModel")
import message=require("../model/messageModel");
import version=require("../model/versionModel")
import poll=require("../model/pollModel")
import article=require("../model/articleModel")
import template=require("../model/templateModel")
import example=require("../model/exampleModel")
import fs=require("fs-extra");
import uuid=require("uuid");
import zip=require("archiver");
import path=require("path");
import copy=require("recursive-copy");
import rm=require("rimraf");
import nunjucks=require("nunjucks");
import moment=require("moment");
import request=require("../third/requestAsync");
import office=require("officegen");
import {
    GroupModel,
    GroupVersionModel,
    InterfaceModel,
    InterfaceVersionModel, ProjectBaseUrlsModel, ProjectModel,
    ProjectUsersModel,
    UserModel
} from "../model/types";
import download=require("koa-send")
import {api, user} from "../routes/generateParams";
import projectApi = require("../../Common/routes/project")
import {keys} from "../../Common/transform";
import {InstanceType} from "typegoose";
import {ctxFake, IProjectValidateUserRet} from "./types";
class ProjectDao {
    async getChild(docleverVersion:string,cookieSort:number,interfaceCurModel:typeof interfaceModel|typeof interfaceVersion,groupCurModel:typeof group|typeof groupVersion,id:string,obj?:GroupModel|GroupVersionModel,bInter?:boolean) {
        let query:any={
            project:id,
            parent:obj?obj.id:{
                $exists:false
            }
        }
        if(docleverVersion)
        {
            query.version=docleverVersion
        }
        let sort="name";
        if(cookieSort==1)
        {
            sort="-updatedAt";
        }
        else if(cookieSort==2)
        {
            sort="sort";
        }
        let arr:(InstanceType<GroupModel>|InstanceType<GroupVersionModel>|InstanceType<InterfaceModel>|InstanceType<InterfaceVersionModel>)[]=await groupCurModel.find(query,null,{
            sort:sort
        })
        for(let obj of arr)
        {
            obj._doc.data=await this.getChild(docleverVersion,cookieSort,interfaceCurModel,groupCurModel,id,obj as GroupModel|GroupVersionModel,bInter);
        }
        if(bInter && obj)
        {
            let arrInterface=await interfaceCurModel.find({
                group:obj._id
            },"_id name method finish url id delete group",{
                sort:sort
            });
            arr=arr.concat(arrInterface);
        }
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

    async validateUser (docleverVersion:string,id:string,userId:string){
        let ret=<IProjectValidateUserRet>{}
        ret.interfaceModel=interfaceModel;
        ret.groupModel=group;
        ret.statusModel=status;
        if(docleverVersion)
        {
            ret.objVersion=await version.findOne({
                _id:docleverVersion
            })
            if(!ret.objVersion)
            {
                throw e.versionInvalidate;
            }
            ret.interfaceModel=interfaceVersion;
            ret.groupModel=groupVersion;
            ret.statusModel=statusVersion;
        }
        if(id)
        {
            let obj=await project.findOne({
                _id:id,
                $or:[
                    {
                        owner:userId
                    },
                    {
                        users:{
                            $elemMatch:{
                                user:userId,
                                role:0
                            }
                        }
                    }
                ]
            })
            if(!obj)
            {
                obj=await project.findOne({
                    _id:id
                });
                if(!obj)
                {
                    throw e.projectNotFound;
                }
                if(obj.team)
                {
                    let arrUser=await teamGroup.find({
                        team:obj.team,
                        users:{
                            $elemMatch:{
                                user:userId,
                                role:{
                                    $in:[0,2]
                                }
                            }
                        }
                    })
                    if(arrUser.length==0)
                    {
                        throw e.userForbidden;
                    }
                    ret.objProject=obj;
                    return ret;
                }
                else
                {
                    throw e.userForbidden;
                }
            }
            else
            {
                ret.objProject=obj;
                return ret;
            }
        }
        else
        {
            return ret;
        }

    }

    async inProject (docleverVersion:string,referer:string,id:string,versionId:string,userId:string){
        let ret=<IProjectValidateUserRet>{}
        ret.interfaceModel=interfaceModel;
        ret.groupModel=group;
        ret.statusModel=status;
        if(docleverVersion || versionId)
        {
            ret.objVersion=await version.findOne({
                _id:docleverVersion || versionId
            })
            if(!ret.objVersion)
            {
                throw e.versionInvalidate;
            }
            ret.interfaceModel=interfaceVersion;
            ret.groupModel=groupVersion;
            ret.statusModel=statusVersion;
        }
        let obj=await project.findOne({
            _id:id,
            $or:[
                {
                    owner:userId
                },
                {
                    "users.user":userId
                }
            ]
        })
        if(!obj)
        {
            obj=await project.findOne({
                _id:id
            });
            if(!obj)
            {
                throw e.projectNotFound;
            }
            ret.objProject=obj;
            if(obj.team)
            {
                let arrUser=await teamGroup.find({
                    team:obj.team,
                    users:{
                        $elemMatch:{
                            user:userId,
                            role:{
                                $in:[0,2]
                            }
                        }
                    }
                })
                if(arrUser.length==0 && !obj.public && referer && !referer.endsWith("public/public.html"))
                {
                    throw e.userForbidden;
                }
            }
            else if(!obj.public && referer && !referer.endsWith("public/public.html"))
            {
                throw e.userForbidden;
            }
            return ret;
        }
        else
        {
            ret.objProject=obj;
            return ret;
        }

    }

    async create (id:string,name:string,dis:string,teamId:string,bPublic:number,bImport:number,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["dovleverversion"],id,userId)
        let query:any={
            name:name,
            owner:userId
        }
        if(dis)
        {
            query.dis=dis
        }
        if(teamId)
        {
            query.team=teamId
        }
        if(bPublic!==undefined)
        {
            query.public=bPublic
        }
        if(!id)
        {
            if(bImport==1)
            {
                query.source={
                    type:0
                }
            }
            let obj=await project.create(query);
            if(bImport!=1)
            {
                let query:any={
                    name:"未命名",
                    project:obj._id,
                    id:uuid()
                }
                if(ctx.headers["docleverversion"])
                {
                    query.version=ctx.headers["docleverversion"]
                }
                await objModel.groupModel.create(query)
            }
            let query1:any={
                name:"#回收站",
                project:obj._id,
                type:1,
                id:uuid()
            }
            if(ctx.headers["docleverversion"])
            {
                query1.version=ctx.headers["docleverversion"]
            }
            await objModel.groupModel.create(query1)
            obj._doc.role=0;
            obj._doc.userCount=1;
            obj._doc.interfaceCount=0;
            obj._doc.own=1;
            return obj
        }
        else
        {
            delete query.owner;
            let obj=await project.findOneAndUpdate({
                _id:id
            },query,{
                new:true
            });
            return obj
        }

    }


    async addMember (id:string,user:string,role:number,option:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["dovleverversion"],id,userId)
        let obj=objModel.objProject;
        let u=await userModel.findOne({
            name:user
        })
        if(!u)
        {
            throw e.userNotFound;
        }
        else if(u._id.toString()==userId)
        {
            throw e.userForbidden;
        }
        else if(u._id.toString()==obj.owner.toString())
        {
            throw e.userExists;
        }
        else if(obj.team)
        {
            let bExist=await this.existUserInTeam(obj.team.toString(),u._id);
            if(!bExist)
            {
                throw e.userNotInTeam;
            }
        }
        for(let o of obj.users)
        {
            if((o as ProjectUsersModel).user.toString()==u._id.toString())
            {
                throw e.userExists;
            }
        }
        let query:any={
            user:u._id,
            role:role
        };
        if(role==1 && option)
        {
            query.option=JSON.parse(option);
        }
        await project.update({
            _id:obj._id
        },{
            $addToSet:{
                users:query
            }
        });
        let ret=<{
            role:number,
            user:typeof u,
            option?:any
        }>{
            role:role,
            user:u
        }
        if(option)
        {
            ret.option=query.option
        }
        return ret

    }


    async role (id:string,user:string,role:number,option:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["dovleverversion"],id,userId)
        let update={
            "users.$.role":role
        };
        if(role==0)
        {
            update["$unset"]={
                "users.$.option":1
            }
        }
        else if(role==1 && option)
        {
            update["users.$.option"]=JSON.parse(option);
        }
        await project.update({
            _id:id,
            "users.user":user
        },update);

    }


    async removeMember (id:string,user:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["dovleverversion"],id,userId)
        await project.update({
            _id:id,
            "users.user":user
        },{
            $pull:{
                users:{
                    user:user
                }
            }
        });

    }


    async list (userId:string){

        let obj=<{
            create:InstanceType<ProjectModel>[],
            join:InstanceType<ProjectModel>[],
            public:InstanceType<ProjectModel>[]
        }>{},ret=[];
        let arr=await project.find({
            owner:userId,
            team:{
                $exists:false
            }
        },"name dis users createdAt",{
            sort:"-createdAt"
        });
        arr.forEach(function (obj) {
            obj._doc.role=0;
            obj._doc.own=1;
        })
        arr.sort(function (obj1,obj2) {
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
        for(let obj of arr)
        {
            obj._doc.userCount=obj.users.length+1;
            delete obj._doc.users;
            obj._doc.interfaceCount=await interfaceModel.count({
                project:obj._id
            })
        }
        obj.create=arr;
        arr=await project.find({
            users:{
                $elemMatch:{
                    user:userId,
                    role:0
                }
            },
            team:{
                $exists:false
            }
        },"name dis users createdAt",{
            sort:"-createdAt"
        })
        arr.forEach(function (obj) {
            obj._doc.own=0;
            obj._doc.role=0;
        })
        ret=arr;
        arr=await project.find({
            users:{
                $elemMatch:{
                    user:userId,
                    role:1
                }
            },
            team:{
                $exists:false
            }
        },"name dis users createdAt",{
            sort:"-createdAt"
        })
        arr.forEach(function (obj) {
            obj._doc.own=0;
            obj._doc.role=1;
        })
        ret=ret.concat(arr);
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
        obj.join=ret;
        arr=await project.find({
            owner:{
                $ne:userId
            },
            "users.user":{
                $ne:userId
            },
            public:1
        },"name dis users createdAt",{
            sort:"-createdAt"
        });
        arr.forEach(function (obj) {
            obj._doc.role=1;
            obj._doc.own=0;
        })
        arr.sort(function (obj1,obj2) {
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
        for(let obj of arr)
        {
            obj._doc.userCount=obj.users.length+1;
            delete obj._doc.users;
            obj._doc.interfaceCount=await interfaceModel.count({
                project:obj._id
            })
        }
        obj.public=arr;
        return obj

    }

    async filterList (name:string,teamId:string,userId:string){

        let ret:InstanceType<ProjectModel>[]=[];
        if(teamId)
        {
            let teamGroup
            let obj=await team.findOne({
                _id:teamId,
                owner:userId
            })
            if(!obj)
            {
                let arr=await teamGroup.find({
                    team:teamId,
                    "users.user":userId
                })
                if(arr.length==0)
                {
                    throw e.projectNotFound;
                    return;
                }
                else
                {
                    teamGroup=arr;
                    obj=await team.findOne({
                        _id:arr[0].team
                    })
                }
            }
            let objTeam=obj;
            let access:number
            if(objTeam.owner.toString()==userId)
            {
                access=1;
            }
            else
            {
                access=0;
                for(let o of teamGroup) {
                    let bFind=false;
                    for(let o1 of o.users)
                    {
                        if (o1.user.toString() == userId && o1.role == 0) {
                            access = 1;
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
            obj=await team.populate(objTeam,{
                path:"owner",
                select:"name photo"
            });
            ret=[];
            if(access)
            {
                ret=await project.find({
                    team:obj._id
                },"name dis users",{
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
                },"name dis users",{
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
                },"name dis users",{
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
                },"name dis users",{
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
        }
        else
        {
            let reg=new RegExp(name,"i");
            let arr=await project.find({
                owner:userId,
                name:reg,
                team:{
                    $exists:false
                }
            },"name dis createdAt",{
                sort:"-createdAt"
            });
            arr.forEach(function (obj) {
                obj._doc.role=0;
                obj._doc.own=1;
            })
            ret=arr;
            arr=await project.find({
                owner:{
                    $ne:userId
                },
                "users.user":{
                    $ne:userId
                },
                name:reg,
                public:1
            },"name dis createdAt",{
                sort:"-createdAt"
            });
            arr.forEach(function (obj) {
                obj._doc.role=1;
                obj._doc.own=0;
            })
            ret=ret.concat(arr);
            arr=await project.find({
                users:{
                    $elemMatch:{
                        user:userId,
                        role:0
                    }
                },
                name:reg,
                team:{
                    $exists:false
                }
            },"name dis createdAt",{
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
                name:reg,
                team:{
                    $exists:false
                }
            },"name dis createdAt",{
                sort:"-createdAt"
            })
            arr.forEach(function (obj) {
                obj._doc.own=0;
                obj._doc.role=1;
            })
            ret=ret.concat(arr);
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
        }
        return ret
    }

    async url (id:string,urls:string,userId:string,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,null,userId)
        let arr:ProjectBaseUrlsModel[]=JSON.parse(urls);
        arr=arr.map(function (obj) {
            if(!obj.url.startsWith("http://") && !obj.url.startsWith("https://"))
            {
                obj.url="http://"+obj.url;
            }
            return obj;
        })
        if(objModel.objVersion)
        {
            await version.update({
                _id:objModel.objVersion._id
            },{
                baseUrls:arr
            })
        }
        else
        {
            await project.update({
                _id:id
            },{
                baseUrls:arr
            })
        }
        return arr

    }


    async info (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,null,userId)
        let obj=await project.findOne({
            _id:id
        },null,{
            populate:{
                path:"users.user",
                select:"-password -question -answer"
            }
        })
        if(objModel.objVersion)
        {
            obj._doc.baseUrls=objModel.objVersion.baseUrls;
            obj._doc.before=objModel.objVersion.before;
            obj._doc.after=objModel.objVersion.after;
            obj._doc.source=objModel.objVersion.source;
        }
        return obj
    }


    async groupList (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,null,userId)
        let arr=await this.getChild(ctx.headers["dovleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel,objModel.groupModel,id,null,false);
        return arr
    }


    async interfaceList (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,null,userId)
        let arr=await this.getChild(ctx.headers["dovleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel,objModel.groupModel,id,null,true);
        return {
            data:arr,
            baseUrl:objModel.objVersion?objModel.objVersion.baseUrls:objModel.objProject.baseUrls
        }
    }


    async clear (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["dovleverversion"],id,userId)
        let query:any={
            project:id,
            type:1
        }
        if(ctx.headers["docleverversion"])
        {
            query.version=ctx.headers["docleverversion"]
        }
        let obj=await objModel.groupModel.findOne(query);
        let arr=await  objModel.interfaceModel.find({
            group:obj._id
        })
        for(let o of arr)
        {
            await example.remove({
                interface:o._id
            })
            await o.remove();
        }
        await interfaceSnapshot.remove({
            group:obj._id
        });
        let ret=await this.getChild(ctx.headers["dovleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel,objModel.groupModel,id,null,true);
        return ret

    }


    async removeProject (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["dovleverversion"],id,userId)
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


    async quit (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,null,userId)
        let obj=await project.findOne({
            _id:id
        });
        if(obj.owner.toString()==userId)
        {
            throw e.userForbidden;
        }
        let index=-1;
        for(let i=0;i< obj.users.length;i++)
        {
            let u=obj.users[i];
            if((u as ProjectUsersModel).user.toString()==userId)
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
            obj.users.splice(index,1);
            await obj.save();
        }

    }


    async addUrl (id:string,url:string,userId:string,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,null,userId)
        if(!url.startsWith("http://") && !url.startsWith("https://"))
        {
            url="http://"+url;
        }
        if(objModel.objVersion)
        {
            await version.update({
                _id:objModel.objVersion._id
            },{
                $addToSet:
                    {
                        baseUrls:{
                            url:url,
                            remark:""
                        }
                    }
            })
        }
        else
        {
            await project.update({
                _id:id
            },{
                $addToSet:
                    {
                        baseUrls:{
                            url:url,
                            remark:""
                        }
                    }
            })
        }

    }


    async exportJSON (id:string,versionId:string,userId:string,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,versionId,userId)
        let obj:any={};
        obj.flag="SBDoc"
        obj.info={
            name:objModel.objProject.name,
            description:objModel.objProject.dis
        }
        if(objModel.objVersion)
        {
            obj.global={
                baseurl:objModel.objVersion.baseUrls,
                before:objModel.objVersion.before,
                after:objModel.objVersion.after
            }
        }
        else
        {
            obj.global={
                baseurl:objModel.objProject.baseUrls,
                before:objModel.objProject.before,
                after:objModel.objProject.after
            }
        }
        let arr=await article.find({
            project:objModel.objProject._id
        },"content title",{
            sort:"-updatedAt"
        })
        obj.global.article=arr.map(function (obj) {
            return {
                title:obj.title,
                content:obj.content
            }
        });
        let query:any={
            project:objModel.objProject._id
        }
        if(versionId)
        {
            query.version=versionId
        }
        obj.global.status=await objModel.statusModel.find(query,"-_id -project -version");
        if(!query.version)
        {
            query.version={
                $exists:false
            }
        }
        obj.global.template=await template.find(query,"-_id -project -version")
        query={
            project:objModel.objProject._id
        }
        if(versionId)
        {
            query.version=versionId
        }
        let getChild=async function(obj?) {
            let query:any={
                project:objModel.objProject._id,
                parent:obj?obj.id:{
                    $exists:false
                }
            }
            if(versionId)
            {
                query.version=versionId
            }
            let arr=await objModel.groupModel.find(query,null,{
                sort:"name"
            })
            let ret=[];
            for(let obj of arr)
            {
                let o={
                    name:obj.name,
                    type:obj.type,
                    id:obj.id,
                    data:[]
                }
                o.data=await getChild(obj);
                ret.push(o);
            }
            if(obj)
            {
                let arrInter=await objModel.interfaceModel.find({
                    group:obj._id
                },null,{
                    sort:"name"
                })
                for(let item of arrInter)
                {
                    let newInter:any={};
                    for(let key in item._doc)
                    {
                        if(item._doc.hasOwnProperty(key) && key!="__v" && key!="_id" && key!="project" && key!="group" && key!="owner" && key!="editor" && key!="createdAt" && key!="updatedAt")
                        {
                            newInter[key]=item._doc[key];
                        }
                    }
                    for(let o of newInter.param)
                    {
                        o.example=await example.find({
                            interface:item._doc._id,
                            paramId:o.id
                        },"-_id -createdAt -updatedAt -project -interface -owner")
                    }
                    ret.push(newInter);
                }
            }
            return ret;
        }
        obj.data=await getChild();
        let content=JSON.stringify(obj);
        let headers:any={
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename*=UTF-8\'\''+encodeURIComponent(objModel.objProject.name)+".json",
            "Transfer-Encoding": "chunked",
            "Expires":0,
            "Cache-Control":"must-revalidate, post-check=0, pre-check=0",
            "Content-Transfer-Encoding":"binary",
            "Pragma":"public",
        }
        return {headers,content}

    }

    async importJSON (json:string,teamId:string,userId:string){
        let obj;
        try {
            obj=JSON.parse(json);
        }
        catch (err)
        {
            throw e.systemReason;
            return;
        }
        if(obj.flag!="SBDoc")
        {
            throw e.systemReason;
            return;
        }
        let query:any={
            name:obj.info.name,
            owner:userId
        }
        if(obj.info.dis)
        {
            query.dis=obj.info.dis
        }
        if(obj.global.baseurl)
        {
            query.baseUrls=obj.global.baseurl
        }
        if(obj.global.before)
        {
            query.before=obj.global.before;
        }
        if(obj.global.after)
        {
            query.after=obj.global.after;
        }
        if(teamId)
        {
            query.team=teamId;
        }
        let objProject=await project.create(query);
        if(obj.global.article && obj.global.article.length>0)
        {
            await article.insertMany(obj.global.article.map(function (obj) {
                return {
                    title:obj.title,
                    content:obj.content,
                    project:objProject._id,
                    creator:userId
                }
            }));
        }
        if(obj.global.status.length>0)
        {
            for(let item of obj.global.status)
            {
                item.project=objProject._id;
                await status.create(item);
            }
        }
        if(obj.global.template && obj.global.template.length>0)
        {
            for(let item of obj.global.template)
            {
                item.project=objProject._id;
                await template.create(item);
            }
        }
        let bTrash=false,interfaceCount=0;
        let importChild=async function (data,objParent?) {
            for(let item of data)
            {
                if(item.type==1)
                {
                    bTrash=true;
                }
                if(item.data)
                {
                    let query:any={
                        name:item.name,
                        project:objProject._id,
                        type:item.type,
                        id:item.id?item.id:uuid()
                    };
                    if(objParent)
                    {
                        query.parent=objParent.id;
                    }
                    let objGroup=await group.create(query);
                    await importChild(item.data,objGroup);
                }
                else
                {
                    interfaceCount++;
                    item.project=objProject._id;
                    item.group=objParent._id;
                    item.owner=userId;
                    item.editor=userId;
                    if(!item.param)
                    {
                        item.param=[];
                        let o:any={
                            name:"未命名",
                            remark:"",
                            id:uuid(),
                            header:item.header,
                            queryParam:item.queryParam,
                            restParam:item.restParam,
                            outParam:item.outParam,
                            outInfo:item.outInfo,
                            before:item.before,
                            after:item.after
                        }
                        if(item.bodyParam)
                        {
                            o.bodyParam=item.bodyParam;
                            o.bodyInfo=item.bodyInfo;
                        }
                        delete item.header;
                        delete item.queryParam;
                        delete item.restParam;
                        delete item.outParam;
                        delete item.outInfo;
                        delete item.before;
                        delete item.after;
                        delete item.bodyParam;
                        delete item.bodyInfo;
                        item.param.push(o);
                    }
                    let objInter=await interfaceModel.create(item);
                    for(let o of item.param)
                    {
                        if(o.example && o.example.length>0)
                        {
                            for(let objExample of o.example)
                            {
                                objExample.owner=userId;
                                objExample.project=objProject._id;
                                objExample.interface=objInter._id;
                                await example.create(objExample);
                            }
                        }
                    }
                }
            }
        }
        await importChild(obj.data);
        if(!bTrash)
        {
            await group.create({
                name:"#回收站",
                project:objProject._id,
                type:1,
                id:uuid()
            })
        }
        objProject._doc.role=0;
        objProject._doc.userCount=1;
        objProject._doc.interfaceCount=interfaceCount;
        objProject._doc.own=1;
        return objProject

    }


    async setInject (id:string,before:string,after:string,userId:string,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,null,userId)
        if(objModel.objVersion)
        {
            objModel.objVersion.before=before;
            objModel.objVersion.after=after;
            await objModel.objVersion.save();
        }
        else
        {
            objModel.objProject.before=before;
            objModel.objProject.after=after;
            await objModel.objProject.save();
        }

    }


    async urlList (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,null,userId)
        if(objModel.objVersion)
        {
            return objModel.objVersion.baseUrls
        }
        else
        {
            return objModel.objProject.baseUrls
        }

    }


    async getImportMember (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,null,userId)
        let arrProject=await project.find({
            $or:[
                {
                    "users.user":userId
                },
                {
                    owner:userId
                }
            ]
        },null,{
            populate:{
                path:"users.user",
                select:"name photo"
            }
        });
        arrProject=await project.populate(arrProject,{
            path:"owner",
            select:"name photo"
        })
        var arrExcept=[objModel.objProject.owner];
        arrExcept=arrExcept.concat(objModel.objProject.users.map(function (obj) {
            return (obj as ProjectUsersModel).user;
        }));
        var arrRet:UserModel[]=[];
        for(let objProject of arrProject)
        {
            let arr=[objProject.owner].concat(objProject.users.map(function (obj) {
                return (obj as ProjectUsersModel).user
            }));
            for(let obj of arr)
            {
                let bFind=false;
                for(let obj1 of arrExcept)
                {
                    if(obj1.toString()==(obj as UserModel)._id.toString())
                    {
                        bFind=true;
                        break;
                    }
                }
                if(bFind)
                {
                    continue;
                }
                for(let obj1 of arrRet)
                {
                    if(obj1._id.toString()==(obj as UserModel)._id.toString())
                    {
                        bFind=true;
                        break;
                    }
                }
                if(bFind)
                {
                    continue;
                }
                let objUser=await userModel.findOne({
                    _id:(obj as UserModel)._id
                },"_id")
                if(!objUser)
                {
                    continue;
                }
                arrRet.push(obj as UserModel);
            }
        }
        if(objModel.objProject.team)
        {
            let arrUser=await teamGroup.find({
                team:objModel.objProject.team
            })
            let arr=[];
            for(let obj of arrUser)
            {
                for(let obj1 of obj.users)
                {
                    let objFind=null;
                    for(let obj2 of arrRet)
                    {
                        if(obj1.user.toString()==obj2._id.toString())
                        {
                            objFind=obj2;
                            break;
                        }
                    }
                    if(objFind)
                    {
                        arr.push(objFind);
                    }
                }
            }
            arrRet=arr;
        }
        return arrRet

    }


    async importMember (id:string,data:string,userId:string,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,null,userId)
        let arr=JSON.parse(data);
        let arrImport=[],arrTeamUser=null;
        if(objModel.objProject.team)
        {
            arrTeamUser=await this.teamUserList(objModel.objProject.team.toString());
        }
        for(let obj of arr)
        {
            let bFind=false;
            for(let obj1 of objModel.objProject.users)
            {
                if(obj.user==(obj1 as ProjectUsersModel).user.toString())
                {
                    bFind=true;
                    break;
                }
            }
            if(arrTeamUser)
            {
                let index=arrTeamUser.indexOf(obj.user);
                if(index==-1)
                {
                    bFind=true;
                }
            }
            if(!bFind)
            {
                arrImport.push(obj);
            }
        }
        await project.update({
            _id:objModel.objProject._id
        },{
            $addToSet:{
                users:{
                    $each:arrImport
                }
            }
        });

    }


    async exportHTML (id:string,versionId:string,userId:string,userName:String,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,versionId,userId)
        let arr:any=await temp.find({
            user:userId,
            project:objModel.objProject._id
        })
        for(let obj of arr)
        {
            let pathName=path.join(con.filePath,"temp",obj.name+".zip");
            if(await fs.pathExists(pathName))
            {
                await fs.unlink(pathName);
            }
            await obj.remove();
        }
        let name=objModel.objProject.name+"-"+userName+"-"+Date.now();
        let obj=await temp.create({
            name:name,
            user:userId,
            project:objModel.objProject._id,
        })
        await copy(path.resolve(__dirname,"../../html"),path.join(con.filePath,"temp",name));
        let query:any={
            project:objModel.objProject._id
        }
        if(versionId)
        {
            query.version=versionId
        }
        let getChild=async function(obj?) {
            let query:any={
                project:objModel.objProject._id,
                parent:obj?obj.id:{
                    $exists:false
                }
            }
            if(versionId)
            {
                query.version=versionId
            }
            let arr:(InstanceType<GroupModel> | InstanceType<GroupVersionModel> | InstanceType<InterfaceModel> | InstanceType<InterfaceVersionModel>)[]=await objModel.groupModel.find(query,null,{
                sort:"name"
            })
            for(let obj of arr)
            {
                obj._doc.data=await getChild(obj);
            }
            if(obj)
            {
                let arrInterface=await objModel.interfaceModel.find({
                    group:obj._id
                },null,{
                    sort:"name"
                });
                arrInterface=await objModel.interfaceModel.populate(arrInterface,{
                    path:"project",
                    select:"name"
                })
                arrInterface=await objModel.interfaceModel.populate(arrInterface,{
                    path:"group",
                    select:"name"
                })
                arrInterface=await objModel.interfaceModel.populate(arrInterface,{
                    path:"owner",
                    select:"name"
                })
                arrInterface=await objModel.interfaceModel.populate(arrInterface,{
                    path:"editor",
                    select:"name"
                })
                arr=arr.concat(arrInterface);
            }
            return arr;
        }
        let arrGroup=await getChild();
        query={
            project:objModel.objProject._id
        }
        if(versionId)
        {
            query.version=versionId
        }
        let arrStatus=await objModel.statusModel.find(query,null,{
            sort:"name"
        });
        if(objModel.objVersion)
        {
            objModel.objProject.baseUrls=objModel.objVersion.baseUrls;
            objModel.objProject.before=objModel.objVersion.before;
            objModel.objProject.after=objModel.objVersion.after;
        }
        arr=await article.find({
            project:objModel.objProject._id
        },null,{
            sort:"-updatedAt",
            populate:{
                path:"creator",
                select:"name"
            }
        })
        // @ts-ignore
        objModel.objProject.article=objModel.objProject._doc.article=arr.map(function (obj) {
            return {
                title:obj.title,
                content:obj.content,
                updatedAt:moment(obj.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
                creator:obj.creator
            }
        });
        nunjucks.configure(path.join(con.filePath,"temp",name), {  });
        var str=nunjucks.render("index.html",{
            interface:JSON.stringify(arrGroup),
            project:JSON.stringify(objModel.objProject),
            status:JSON.stringify(arrStatus),
            name:objModel.objProject.name
        })
        await fs.writeFile(path.join(con.filePath,"temp",name,"index.html"),str);
        var pathName=path.join(con.filePath,"temp",name+".zip");
        var output=fs.createWriteStream(pathName);
        var archive = zip('zip', {
            zlib: { level: 9 }
        });
        output.on('close', async function() {
            rm(path.join(con.filePath,"temp",name),{},function (err) {

            });
            // @ts-ignore
            await download(ctx,pathName);
            obj.remove();
            fs.access(pathName,fs.constants.F_OK,function (err) {
                if(!err)
                {
                    fs.unlink(pathName);
                }
            })
        });
        archive.on('error', function(err) {
            rm(path.join(con.filePath,"temp",name),{},function (err) {

            });
            throw err;
        });
        archive.pipe(output);
        archive.directory(path.join(con.filePath,"temp",name),objModel.objProject.name);
        archive.finalize();
    }


    async setOwner (id:string,user:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["dovleverversion"],id,userId)
        let obj=await userModel.findOne({
            _id:user
        })
        if(!obj)
        {
            throw e.userNotFound;
            return;
        }
        let bInTeam=false;
        if(objModel.objProject.team)
        {
            let bIn=await this.existUserInTeam(objModel.objProject.team.toString(),user);
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
        for(let o of objModel.objProject.users)
        {
            if((o as ProjectUsersModel).user.toString()==user)
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
                owner:user,
                $pull:{
                    "users":{
                        user:user
                    }
                }
            })
        }
        else
        {
            if(bInTeam)
            {
                objModel.objProject.owner=user as any;
                await objModel.objProject.save();
            }
            else
            {
                throw e.userNotInProject;
            }
        }

    }

    async applyList (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["dovleverversion"],id,userId)
        let arr=await apply.find({
            to:id,
            type:1,
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
        return arr

    }


    async handleApply (id:string,applyId:string,state:number,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["dovleverversion"],id,userId)
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
        let objProject=objModel.objProject;
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
                    return (obj as ProjectUsersModel).user.toString();
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
                name:state==1?"您已同意接口项目加入团队":"您已拒绝接口项目加入团队",
                dis:`您已${state==1?"通过":"拒绝"}接口项目${objProject.name}加入团队${(<any>obj.from).name}`,
                user:userId,
                type:1
            })
            await obj.save();
            await apply.update({
                to:objProject._id,
                type:1,
                state:0
            },{
                state:3
            },{
                multi:true
            })
        }

    }


    async setUser (id:string,user:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["dovleverversion"],id,userId)
        let objUser=JSON.parse(user);
        for(let obj of objUser)
        {
            if(obj.user==objModel.objProject.owner.toString())
            {
                throw e.userForbidden;
            }
        }
        objModel.objProject.users=objUser;
        await objModel.objProject.save();

    }


    async getUsers (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,null,userId)
        let obj:InstanceType<ProjectModel>=await project.populate(objModel.objProject,{
            path:"owner",
            select:"name photo"
        });
        obj=await project.populate(obj,{
            path:"users.user",
            select:"name photo"
        });
        let arr=[obj.owner].concat(obj.users.map(function (obj:ProjectUsersModel) {
            return obj.user
        }));
        return arr

    }


    async importRap (json:string,team:string,bodytype:number,userId:string){

        let obj=JSON.parse(json);
        let query:any={
            name:obj.name,
            owner:userId,
            source:{
                type:1
            }
        }
        if(team)
        {
            query.team=team
        }
        let objProject=await project.create(query);
        await group.create({
            name:"#回收站",
            project:objProject._id,
            type:1,
            id:uuid()
        });
        let interfaceCount=0;
        for(let objModule of obj.moduleList)
        {
            for(let objPage of objModule.pageList)
            {
                let groupName;
                if(obj.moduleList.length>1)
                {
                    groupName=objModule.name;
                    groupName+="-"+objPage.name;
                }
                else
                {
                    groupName=objPage.name;
                }
                let query={
                    name:groupName,
                    project:objProject._id,
                    type:0,
                    id:uuid()
                }
                let objGroup=await group.create(query);
                for(let objAction of objPage.actionList)
                {
                    interfaceCount++;
                    let arrMethod=["GET","POST","PUT","DELETE"];
                    let update:any={
                        name:objAction.name,
                        project:objProject._id,
                        group:objGroup._id,
                        url:objAction.requestUrl,
                        remark:objAction.description,
                        method:arrMethod[objAction.requestType-1],
                        owner:userId,
                        editor:userId,
                        param:[
                            {
                                before:{
                                    mode:0,
                                    code:""
                                },
                                after:{
                                    mode:0,
                                    code:""
                                },
                                name:"未命名",
                                remark:"",
                                id:uuid()
                            }
                        ],
                        id:uuid()
                    };
                    let rest=[];
                    let arrMatch=update.url.match(/(\/):(.+?)(?=\b|\?|#|\/)/g);
                    if(arrMatch && arrMatch.length>0)
                    {
                        arrMatch.forEach(function (obj) {
                            rest.push({
                                value:{
                                    "status" : "",
                                    "data" : [],
                                    "type" : 0
                                },
                                name:obj.substr(2),
                                remark:""
                            })
                        })
                        update.url=update.url.replace(/(\/):(.+?)(?=\b|\?|#|\/)/g,"$1{$2}");
                    }
                    update.param[0].restParam=rest;
                    let query=[],body=[],header=[];
                    if(update.method=="GET" || update.method=="DELETE")
                    {
                        objAction.requestParameterList.forEach(function (obj) {
                            query.push({
                                name:obj.identifier.split("|")[0].trim(),
                                remark:obj.name,
                                must:1,
                                value:{
                                    "status" : "",
                                    "data" : [],
                                    "type" : 0
                                }
                            })
                        })
                    }
                    else
                    {
                        let bodyInfo;
                        if(bodytype==0)
                        {
                            bodyInfo={
                                type:0,
                                rawType:0,
                                rawTextRemark:"",
                                rawFileRemark:"",
                                rawText:"",
                                rawJSON:[{
                                    name:"",
                                    must:1,
                                    type:0,
                                    remark:"",
                                    show:1,
                                    mock:"",
                                    drag:1
                                }],
                                rawJSONType:0
                            };
                            objAction.requestParameterList.forEach(function (obj) {
                                body.push({
                                    name:obj.identifier.split("|")[0].trim(),
                                    remark:obj.name,
                                    must:1,
                                    value:{
                                        "status" : "",
                                        "data" : [],
                                        "type" : 0
                                    },
                                    type:0
                                })
                            })
                            header.push({
                                name:"Content-Type",
                                value:"application/x-www-form-urlencoded",
                                remark:""
                            })
                        }
                        else
                        {
                            bodyInfo={
                                type:1,
                                rawType:2,
                                rawTextRemark:"",
                                rawFileRemark:"",
                                rawText:"",
                                rawJSON:[{
                                    name:"",
                                    must:1,
                                    type:0,
                                    remark:"",
                                    show:1,
                                    mock:"",
                                    drag:1
                                }],
                                rawJSONType:0
                            };
                            for(let o of objAction.requestParameterList)
                            {
                                handleJSON(o,bodyInfo.rawJSON);
                            }
                            header.push({
                                name:"Content-Type",
                                value:"application/json",
                                remark:""
                            })
                        }
                        update.param[0].bodyInfo=bodyInfo;
                    }
                    update.param[0].queryParam=query;
                    update.param[0].bodyParam=body;
                    update.param[0].header=header;
                    let result=[];
                    function handleJSON(obj,arrRaw,bArr?) {
                        if(obj.dataType=="string")
                        {
                            let o={
                                mock : "",
                                remark : obj.name,
                                type : 0,
                                must : 1,
                                name : bArr?null:obj.identifier.split("|")[0].trim()
                            }
                            arrRaw.push(o);
                        }
                        else if(obj.dataType=="number")
                        {
                            let o={
                                mock : "",
                                remark : obj.name,
                                type : 1,
                                must : 1,
                                name : bArr?null:obj.identifier.split("|")[0].trim()
                            }
                            arrRaw.push(o);
                        }
                        else if(obj.dataType=="boolean")
                        {
                            let o={
                                mock : "",
                                remark : obj.name,
                                type : 2,
                                must : 1,
                                name : bArr?null:obj.identifier.split("|")[0].trim()
                            }
                            arrRaw.push(o);
                        }
                        else if(obj.dataType=="object" || obj.dataType=="array")
                        {
                            let o={
                                mock : "",
                                remark : obj.name,
                                type : obj.dataType=="array"?3:4,
                                must : 1,
                                name : bArr?null:obj.identifier.split("|")[0].trim(),
                                data:[]
                            }
                            arrRaw.push(o);
                            for(let o1 of obj.parameterList)
                            {
                                arguments.callee(o1,o.data,obj.dataType=="array"?1:null)
                            }
                        }
                        else if(obj.dataType=="array<string>" || obj.dataType=="array<number>" || obj.dataType=="array<boolean>")
                        {
                            let o={
                                mock : "",
                                remark : obj.name,
                                type : 3,
                                must : 1,
                                name : bArr?null:obj.identifier.split("|")[0].trim(),
                                data:[{
                                    mock : "",
                                    remark : "",
                                    type : obj.dataType=="array<string>"?0:(obj.dataType=="array<number>"?1:2),
                                    must : 1,
                                    name : null
                                }]
                            }
                            arrRaw.push(o);
                        }
                        else if(obj.dataType=="array<object>")
                        {
                            let o={
                                mock : "",
                                remark : obj.name,
                                type : 3,
                                must : 1,
                                name : bArr?null:obj.identifier.split("|")[0].trim(),
                                data:[{
                                    mock : "",
                                    remark : "",
                                    type :4,
                                    must : 1,
                                    name : null,
                                    data:[]
                                }]
                            }
                            arrRaw.push(o);
                            for(let o1 of obj.parameterList)
                            {
                                arguments.callee(o1,o.data[0].data)
                            }
                        }
                    }
                    for(let o of objAction.responseParameterList)
                    {
                        handleJSON(o,result);
                    }
                    update.param[0].outParam=result;
                    update.param[0].outInfo={
                        "jsonType" : 0,
                        "rawMock" : "",
                        "rawRemark" : "",
                        "type" : 0
                    }
                    await interfaceModel.create(update);
                }
            }
        }
        objProject._doc.role=0;
        objProject._doc.userCount=1;
        objProject._doc.interfaceCount=interfaceCount;
        objProject._doc.own=1;
        return objProject

    }

    async importSwagger (json:string,url:string,team:string,userId:string){

        let data=json;
        if(url)
        {
            data=await request({
                method:"GET",
                url:url
            }).then(function (response) {
                return response.body;
            })
        }
        let obj=JSON.parse(data);
        let update:any={
            name:obj.info.title,
            owner:userId,
            source:url?{
                type:0,
                url:url
            }:{
                type:0
            }
        }
        if(team)
        {
            update.team=team
        }
        if(obj.host)
        {
            let url=obj.host;
            if(obj.basePath && obj.basePath!="/")
            {
                url+=obj.basePath
            }
            if(obj.schemes && obj.schemes.length>0)
            {
                url=obj.schemes[0]+"://"+url;
            }
            else
            {
                url="http://"+url;
            }
            update.baseUrls=[{
                url:url,
                remark:""
            }]
        }
        let objProject=await project.create(update);
        await group.create({
            name:"#回收站",
            project:objProject._id,
            type:1,
            id:uuid()
        });
        let objGroup={};
        if(obj.tags)
        {
            for(let o of obj.tags){
                objGroup[o.name]=await group.create({
                    name:o.name,
                    project:objProject._id,
                    type:0,
                    id:uuid()
                });
            }
        }
        else
        {
            let arr=[];
            for(let key in obj.paths)
            {
                let objInter=obj.paths[key];
                for(let key1 in objInter)
                {
                    let objIns=objInter[key1];
                    if(objIns.tags)
                    {
                        objIns.tags.forEach(function (obj) {
                            if(arr.indexOf(obj)==-1)
                            {
                                arr.push(obj);
                            }
                        })
                    }
                }
            }
            if(arr.length>0)
            {
                for(let obj of arr){
                    objGroup[obj]=await group.create({
                        name:obj,
                        project:objProject._id,
                        type:0,
                        id:uuid()
                    });
                }
            }
            else
            {
                objGroup["未命名"]=await group.create({
                    name:"未命名",
                    project:objProject._id,
                    type:0,
                    id:uuid()
                });
            }
        }
        let objDef={};
        function handleDef(def,root,arrDef) {
            let ref=false,obj,key;
            if(def.$ref)
            {
                ref=true;
                key=def.$ref.substr(14);
                if(objDef[key])
                {
                    if(arrDef.indexOf(key)>-1)
                    {
                        return null;
                    }
                    else
                    {
                        return objDef[key];
                    }
                }
                else
                {
                    if(arrDef.indexOf(key)>-1)
                    {
                        return null;
                    }
                    arrDef.push(key);
                    obj=root[key];
                }
            }
            else
            {
                obj=def;
            }
            if(!obj)
            {
                return null;
            }
            let objRaw:any={
                mock : "",
                remark : "",
                type : 0,
                must : 1,
                name : null
            };
            if(obj.type=="string" || obj.type=="byte" || obj.type=="binary" || obj.type=="date" || obj.type=="dateTime" || obj.type=="password")
            {
                objRaw.type=0;
            }
            else if(obj.type=="integer" || obj.type=="long" || obj.type=="float" || obj.type=="double")
            {
                objRaw.type=1;
            }
            else if(obj.type=="boolean")
            {
                objRaw.type=2;
            }
            else if(obj.type=="array")
            {
                objRaw.type=3;
                objRaw.data=[];
                let index=arrDef.length;
                let obj1=arguments.callee(obj.items,root,arrDef);
                arrDef.splice(index);
                if(obj1!==null)
                {
                    obj1=util.clone(obj1);
                    objRaw.data.push(obj1);
                }
            }
            else if(obj.type=="object" || obj.type===undefined)
            {
                objRaw.type=4;
                objRaw.data=[];
                for(let key in obj.properties)
                {
                    let index=arrDef.length;
                    let obj1=arguments.callee(obj.properties[key],root,arrDef);
                    arrDef.splice(index);
                    if(obj1!==null)
                    {
                        obj1=util.clone(obj1);
                        obj1.name=key;
                        objRaw.data.push(obj1);
                    }
                }
            }
            if(obj.description)
            {
                objRaw.remark=obj.description;
            }
            if(obj.default!==undefined)
            {
                objRaw.mock=obj.default;
            }
            if(obj.example!==undefined || obj.enum!==undefined)
            {
                objRaw.value={
                    type:0,
                    status:"",
                    data:[]
                };
                if(obj.example!==undefined)
                {
                    objRaw.value.data.push({
                        value:obj.example,
                        remark:""
                    })
                }
                if(obj.enum!==undefined)
                {
                    objRaw.value.data=objRaw.value.data.concat(obj.enum.map(function (obj) {
                        return {
                            value:obj,
                            remark:""
                        }
                    }));
                }
            }
            if(def.$ref)
            {
                objDef[key]=objRaw;
            }
            return objRaw;
        }
        if(obj.definitions)
        {
            for(let key in obj.definitions)
            {
                let val=obj.definitions[key];
                let arrDef=[key];
                let o=handleDef(val,obj.definitions,arrDef);
                objDef[key]=o;
            }
        }
        let interfaceCount=0;
        let arrMethod=["GET","POST","PUT","DELETE","PATCH"]
        for(let path in obj.paths)
        {
            let obj1=obj.paths[path];
            for(let method in obj1)
            {
                let interRaw=obj1[method];
                if(arrMethod.indexOf(method.toUpperCase())==-1)
                {
                    continue;
                }
                interfaceCount++;
                let name;
                if(interRaw.summary)
                {
                    name=interRaw.summary
                }
                else
                {
                    name=path;
                    let index=name.lastIndexOf("/");
                    if(index>-1)
                    {
                        name=name.substr(index+1);
                    }
                }
                let update={
                    name:name,
                    project:objProject._id,
                    group:(interRaw.tags && objGroup[interRaw.tags[0]])?objGroup[interRaw.tags[0]]._id:objGroup["未命名"]._id,
                    url:path,
                    remark:interRaw.description,
                    method:method.toUpperCase(),
                    owner:userId,
                    editor:userId,
                    param:[
                        {
                            before:{
                                mode:0,
                                code:""
                            },
                            after:{
                                mode:0,
                                code:""
                            },
                            name:"未命名",
                            remark:"",
                            id:uuid(),
                            queryParam:[],
                            header:[],
                            restParam:[],
                            outInfo:{
                                "rawMock" : "",
                                "rawRemark" : "",
                                "type" : 0
                            },
                            outParam:[],
                        }
                    ],
                    id:uuid()
                };
                let rest=[],query=[],header=[],body=[];
                let bodyInfo:any={
                    type:0,
                    rawType:0,
                    rawTextRemark:"",
                    rawFileRemark:"",
                    rawText:"",
                    rawJSON:[{
                        name:"",
                        must:1,
                        type:0,
                        remark:"",
                        show:1,
                        mock:"",
                        drag:1
                    }],
                    rawJSONType:0
                };
                let outInfo={
                    type:0,
                    rawRemark:"",
                    rawMock:"",
                    jsonType:0
                };
                let contentType=interRaw.consumes?interRaw.consumes[0]:null;
                if(!contentType)
                {
                    if(interRaw.parameters)
                    {
                        for(let obj of interRaw.parameters)
                        {
                            if(obj.in=="body" && obj.schema)
                            {
                                contentType="application/json";
                                break;
                            }
                        }
                    }
                }
                if(contentType)
                {
                    header.push({
                        name:"Content-Type",
                        value:contentType,
                        remark:""
                    });
                    if(contentType=="application/json")
                    {
                        bodyInfo={
                            type:1,
                            rawType:2,
                            rawTextRemark:"",
                            rawFileRemark:"",
                            rawText:"",
                            rawJSON:[{
                                name:"",
                                must:1,
                                type:0,
                                remark:"",
                                show:1,
                                mock:"",
                                drag:1
                            }],
                            rawJSONType:0
                        };
                    }
                }
                if(interRaw.parameters)
                {
                    for(let o of interRaw.parameters)
                    {
                        if(o.in=="path")
                        {
                            rest.push({
                                value:{
                                    "status" : "",
                                    "data" : [],
                                    "type" : 0
                                },
                                name:o.name,
                                remark:o.description?o.description:""
                            })
                        }
                        else if(o.in=="query")
                        {
                            query.push({
                                name:o.name,
                                remark:o.description?o.description:"",
                                must:o.required?1:0,
                                value:{
                                    "status" : "",
                                    "data" : (o.items && o.items.enum)?o.items.enum.map(function (obj) {
                                        return {
                                            value:obj.toString(),
                                            remark:""
                                        }
                                    }):(o.default?[{
                                        value:o.default.toString(),
                                        remark:""
                                    }]:[]),
                                    "type" : 0
                                }
                            })
                        }
                        else if(o.in=="header")
                        {
                            header.push({
                                name:o.name,
                                remark:o.description?o.description:"",
                                value:o.default?o.default:""
                            })
                        }
                        else if(o.in=="body")
                        {
                            if(bodyInfo.type==0)
                            {
                                let objBody={
                                    name:o.name,
                                    type:0,
                                    must:o.required?1:0,
                                    remark:o.description?o.description:""
                                };
                                body.push(objBody);
                            }
                            else if(bodyInfo.type==1 && bodyInfo.rawType==2)
                            {
                                let objBody:any={
                                    mock : "",
                                    remark : o.description,
                                    type : 1,
                                    must : o.required?1:0,
                                    name :o.name
                                };
                                if(o.schema)
                                {
                                    if(o.schema.$ref)
                                    {
                                        let key=o.schema.$ref.substr(14);
                                        if(objDef[key])
                                        {
                                            let o1=util.clone(objDef[key]);
                                            o1.remark=objBody.remark;
                                            o1.must=objBody.must;
                                            o1.name=objBody.name;
                                            objBody=o1;
                                            if(bodyInfo.rawJSON[0].name)
                                            {
                                                bodyInfo.rawJSON.push(objBody);
                                            }
                                            else
                                            {
                                                bodyInfo.rawJSON[0]=objBody;
                                            }
                                        }
                                    }
                                    else
                                    {
                                        if(o.schema.items)
                                        {
                                            objBody.data=[];
                                            objBody.type=3;
                                            if(o.schema.items.$ref)
                                            {
                                                let key=o.schema.items.$ref.substr(14);
                                                if(objDef[key])
                                                {
                                                    let o1=util.clone(objDef[key]);
                                                    objBody.data.push(o1);
                                                    if(bodyInfo.rawJSON[0].name)
                                                    {
                                                        bodyInfo.rawJSON.push(objBody);
                                                    }
                                                    else
                                                    {
                                                        bodyInfo.rawJSON[0]=objBody;
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                let type;
                                                let o1=o.schema.items;
                                                if(o1.type=="string" || o1.type=="byte" || o1.type=="binary" || o1.type=="date" || o1.type=="dateTime" || o1.type=="password")
                                                {
                                                    type=0;
                                                }
                                                else if(o1.type=="integer" || o1.type=="long" || o1.type=="float" || o1.type=="double")
                                                {
                                                    type=1;
                                                }
                                                else if(o1.type=="boolean")
                                                {
                                                    type=2;
                                                }
                                                let o2={
                                                    mock : o1.default!==undefined?o1.default:"",
                                                    remark : o1.description?o1.description:"",
                                                    type : type,
                                                    must : 1,
                                                    name :null
                                                }
                                                objBody.data.push(o2);
                                                if(bodyInfo.rawJSON[0].name)
                                                {
                                                    bodyInfo.rawJSON.push(objBody);
                                                }
                                                else
                                                {
                                                    bodyInfo.rawJSON[0]=objBody;
                                                }
                                            }
                                        }
                                        else if(o.schema.type=="cust" && o.schema.format=="json")
                                        {
                                            objBody.data=[];
                                            objBody.type=3;
                                            let objJSON;
                                            try {
                                                objJSON=JSON.parse(o.schema.content);
                                            }
                                            catch (err)
                                            {
                                                continue;
                                            }
                                            let result=[];
                                            for(let key in objJSON)
                                            {
                                                util.handleResultData(key,objJSON[key],result,null,1,1)
                                            }
                                            objBody.data=result;
                                            if(bodyInfo.rawJSON[0].name)
                                            {
                                                bodyInfo.rawJSON.push(objBody);
                                            }
                                            else
                                            {
                                                bodyInfo.rawJSON[0]=objBody;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if(o.in=="formData")
                        {
                            let objBody={
                                name:o.name,
                                type:o.type!="file"?0:1,
                                must:o.required?1:0,
                                remark:o.description?o.description:""
                            };
                            body.push(objBody);
                            header["Content-Type"]="multipart/form-data";
                        }
                    }
                }
                if(interRaw.responses)
                {
                    let count=0;
                    for(let status in interRaw.responses)
                    {
                        count++;
                        let result=[];
                        let objRes=interRaw.responses[status];
                        if(objRes.schema && objRes.schema.$ref)
                        {
                            let key=objRes.schema.$ref.substr(14);
                            if(objDef[key])
                            {
                                let o1=util.clone(objDef[key]);
                                if(o1.type==4)
                                {
                                    result=o1.data;
                                }
                                else
                                {
                                    outInfo.type=1;
                                    outInfo.rawMock=o1.mock?o1.mock:"";
                                    outInfo.rawRemark=objRes.description?objRes.description:"";
                                }
                            }
                        }
                        else if(objRes.schema && objRes.schema.items)
                        {
                            outInfo.jsonType=1;
                            result=[
                                {
                                    name:null,
                                    must:1,
                                    type:0,
                                    remark:"",
                                    mock:"",
                                }
                            ]
                            if(objRes.schema.items.$ref)
                            {
                                let key=objRes.schema.items.$ref.substr(14);
                                if(objDef[key])
                                {
                                    let o1=util.clone(objDef[key]);
                                    if(o1.type==4)
                                    {
                                        result[0].type=4;
                                        result[0].data=o1.data;
                                    }
                                    else
                                    {
                                        for(let key in o1)
                                        {
                                            result[0][key]=o1[key];
                                        }
                                    }
                                }
                            }
                            else
                            {
                                let type;
                                let o1=objRes.schema.items;
                                if(o1.type=="string" || o1.type=="byte" || o1.type=="binary" || o1.type=="date" || o1.type=="dateTime" || o1.type=="password")
                                {
                                    type=0;
                                }
                                else if(o1.type=="integer" || o1.type=="long" || o1.type=="float" || o1.type=="double")
                                {
                                    type=1;
                                }
                                else if(o1.type=="boolean")
                                {
                                    type=2;
                                }
                                result[0].type=type;
                            }
                        }
                        else if(objRes.schema && objRes.schema.properties)
                        {
                            function __handleRes(key,value,data) {
                                let obj:any={
                                    mock : value.example?value.example:"",
                                    remark : value.description?value.description:"",
                                    type : 0,
                                    must : 1,
                                    name :key?key:null
                                }
                                if(value.type=="string" || value.type=="byte" || value.type=="binary" || value.type=="date" || value.type=="dateTime" || value.type=="password")
                                {
                                    obj.type=0;
                                }
                                else if(value.type=="integer" || value.type=="long" || value.type=="float" || value.type=="double")
                                {
                                    obj.type=1;
                                }
                                else if(value.type=="boolean")
                                {
                                    obj.type=2;
                                }
                                else if(value.type=="array")
                                {
                                    obj.type=3;
                                    obj.data=[];
                                    if(value.items.$ref)
                                    {
                                        let result:any=[
                                            {
                                                name:null,
                                                must:1,
                                                type:0,
                                                remark:"",
                                                mock:"",
                                            }
                                        ]
                                        let def=value.items.$ref.substr(value.items.$ref.lastIndexOf("/")+1);
                                        if(objDef[def])
                                        {
                                            let o1=util.clone(objDef[def]);
                                            if(o1.type==4)
                                            {
                                                result[0].type=4;
                                                result[0].data=o1.data;
                                            }
                                            else
                                            {
                                                for(let key in o1)
                                                {
                                                    result[0][key]=o1[key];
                                                }
                                            }
                                            obj.data=result;
                                        }
                                    }
                                    else
                                    {
                                        let type;
                                        let o1=value.items;
                                        arguments.callee(null,o1,obj.data);
                                    }
                                }
                                else if(value.type=="object")
                                {
                                    obj.type=4;
                                    obj.data=[];
                                    for(let k in value.properties)
                                    {
                                        arguments.callee(k,value.properties[k],obj.data);
                                    }
                                }
                                else if(value.$ref)
                                {
                                    let ref=value.$ref.substr(value.$ref.lastIndexOf("/")+1);
                                    if(objDef[ref])
                                    {
                                        let o1=util.clone(objDef[ref]);
                                        if(o1.type==4)
                                        {
                                            obj.type=4;
                                            obj.data=o1.data;
                                        }
                                        else
                                        {
                                            for(let key in o1)
                                            {
                                                obj[key]=o1[key];
                                            }
                                        }
                                    }
                                }
                                data.push(obj);
                            }
                            for(let key in objRes.schema.properties)
                            {
                                __handleRes(key,objRes.schema.properties[key],result);
                            }
                        }
                        else if(objRes.schema && objRes.schema.type=="cust" && objRes.schema.format=="json")
                        {
                            let objJSON;
                            try {
                                objJSON=JSON.parse(objRes.schema.content);
                            }
                            catch (err)
                            {

                            }
                            if(objJSON)
                            {
                                let result1=[];
                                for(let key in objJSON)
                                {
                                    util.handleResultData(key,objJSON[key],result1,null,1)
                                }
                                result=result1;
                            }
                        }
                        else
                        {
                            outInfo.type=1;
                            if(objRes.schema)
                            {
                                outInfo.rawRemark=objRes.description+"("+(objRes.schema.type?objRes.schema.type:"")+")";
                            }
                            else
                            {
                                outInfo.rawRemark=""
                            }
                        }
                        let objParam:any={
                            name:status,
                            remark:objRes.description?objRes.description:"",
                            id:uuid(),
                            before:{
                                code:"",
                                mode:0
                            },
                            after:{
                                code:"",
                                mode:0
                            }
                        };
                        objParam.restParam=rest;
                        objParam.queryParam=query;
                        objParam.header=header;
                        objParam.outParam=result;
                        objParam.outInfo=outInfo;
                        if(update.method=="POST" || update.method=="PUT" || update.method=="PATCH")
                        {
                            objParam.bodyParam=body;
                            objParam.bodyInfo=bodyInfo;
                        }
                        if(count==1)
                        {
                            update.param[0]=util.clone(objParam)
                        }
                        else
                        {
                            update.param.push(util.clone(objParam))
                        }
                    }
                }
                await interfaceModel.create(update);
            }
        }
        objProject._doc.role=0;
        objProject._doc.userCount=1;
        objProject._doc.interfaceCount=interfaceCount;
        objProject._doc.own=1;
        return objProject

    }

    async updateSwagger (id:string,json:string,url:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["dovleverversion"],id,userId)
        let data=json;
        if(url)
        {
            data=await request({
                method:"GET",
                url:url
            }).then(function (response) {
                return response.body;
            })
        }
        let obj=JSON.parse(data);
        let update,objProject=objModel.objProject;
        if(objModel.objVersion)
        {
            if(obj.host)
            {
                let url=obj.host;
                if(obj.basePath && obj.basePath!="/")
                {
                    url+=obj.basePath
                }
                if(obj.schemes && obj.schemes.length>0)
                {
                    url=obj.schemes[0]+"://"+url;
                }
                else
                {
                    url="http://"+url;
                }
                objModel.objVersion.baseUrls=[{
                    url:url,
                    remark:""
                }]
                objModel.objVersion.source=url?{
                    type:0,
                    url:url
                }:{
                    type:0
                };
                await objModel.objVersion.save();
            }
        }
        else
        {
            if(obj.info.title)
            {
                objModel.objProject.name=obj.info.title;
            }
            objModel.objProject.source=url?{
                type:0,
                url:url
            }:{
                type:0
            }
            if(obj.host)
            {
                let url=obj.host;
                if(obj.basePath && obj.basePath!="/")
                {
                    url+=obj.basePath
                }
                if(obj.schemes && obj.schemes.length>0)
                {
                    url=obj.schemes[0]+"://"+url;
                }
                else
                {
                    url="http://"+url;
                }
                objModel.objProject.baseUrls=[{
                    url:url,
                    remark:""
                }]
            }
            await objModel.objProject.save();
        }
        let query:any={
            project:objModel.objProject._id
        }
        if(objModel.objVersion)
        {
            query.version=objModel.objVersion._id
        }
        query.type=0;
        await objModel.groupModel.update(query,{
            delete:1
        },{
            multi:true
        })
        delete query.type;
        await objModel.interfaceModel.update(query,{
            delete:1
        },{
            multi:true
        })
        let objGroup={};
        if(obj.tags)
        {
            for(let o of obj.tags){
                let query:any={
                    name:o.name,
                    project:objModel.objProject._id
                }
                if(objModel.objVersion)
                {
                    query.version=objModel.objVersion._id
                }
                objGroup[o.name]=await objModel.groupModel.findOne(query);
                if(objGroup[o.name])
                {
                    objGroup[o.name]=await objModel.groupModel.findOneAndUpdate({
                        _id:objGroup[o.name]._id
                    },{
                        name:o.name,
                        $unset:{
                            delete:1
                        }
                    },{
                        new:true
                    })
                }
                else
                {
                    objGroup[o.name]=await objModel.groupModel.create({
                        name:o.name,
                        project:objProject._id,
                        type:0,
                        id:uuid(),
                    });
                }
            }
        }
        else
        {
            let arr=[];
            for(let key in obj.paths)
            {
                let objInter=obj.paths[key];
                for(let key1 in objInter)
                {
                    let objIns=objInter[key1];
                    if(objIns.tags)
                    {
                        objIns.tags.forEach(function (obj) {
                            if(arr.indexOf(obj)==-1)
                            {
                                arr.push(obj);
                            }
                        })
                    }
                }
            }
            if(arr.length>0)
            {
                for(let obj of arr){
                    let query:any={
                        name:obj.name,
                        project:objModel.objProject._id
                    }
                    if(objModel.objVersion)
                    {
                        query.version=objModel.objVersion._id
                    }
                    objGroup[obj]=await objModel.groupModel.findOne(query);
                    if(objGroup[obj])
                    {
                        objGroup[obj]=await objModel.groupModel.findOneAndUpdate({
                            _id:objGroup[obj]._id
                        },{
                            name:obj,
                            $unset:{
                                delete:1
                            }
                        },{
                            new:true
                        })
                    }
                    else
                    {
                        objGroup[obj]=await objModel.groupModel.create({
                            name:obj,
                            project:objProject._id,
                            type:0,
                            id:uuid(),
                        });
                    }
                }
            }
            else
            {
                let objUnName=await objModel.groupModel.findOne({
                    name:"未命名",
                    project:objProject._id,
                    type:0,
                });
                if(!objUnName)
                {
                    objGroup["未命名"]=await objModel.groupModel.create({
                        name:"未命名",
                        project:objProject._id,
                        type:0,
                        id:uuid(),
                    });
                }
                else
                {
                    objGroup["未命名"]=objUnName;
                }
            }
        }
        let objDef={};
        function handleDef(def,root,arrDef) {
            let ref=false,obj,key;
            if(def.$ref)
            {
                ref=true;
                key=def.$ref.substr(14);
                if(objDef[key])
                {
                    if(arrDef.indexOf(key)>-1)
                    {
                        return null;
                    }
                    else
                    {
                        return objDef[key];
                    }
                }
                else
                {
                    if(arrDef.indexOf(key)>-1)
                    {
                        return null;
                    }
                    arrDef.push(key);
                    obj=root[key];
                }
            }
            else
            {
                obj=def;
            }
            if(!obj)
            {
                return null;
            }
            let objRaw:any={
                mock : "",
                remark : "",
                type : 0,
                must : 1,
                name : null
            };
            if(obj.type=="string" || obj.type=="byte" || obj.type=="binary" || obj.type=="date" || obj.type=="dateTime" || obj.type=="password")
            {
                objRaw.type=0;
            }
            else if(obj.type=="integer" || obj.type=="long" || obj.type=="float" || obj.type=="double")
            {
                objRaw.type=1;
            }
            else if(obj.type=="boolean")
            {
                objRaw.type=2;
            }
            else if(obj.type=="array")
            {
                objRaw.type=3;
                objRaw.data=[];
                let index=arrDef.length;
                let obj1=arguments.callee(obj.items,root,arrDef);
                arrDef.splice(index);
                if(obj1!==null)
                {
                    obj1=util.clone(obj1);
                    objRaw.data.push(obj1);
                }
            }
            else if(obj.type=="object" || obj.type===undefined)
            {
                objRaw.type=4;
                objRaw.data=[];
                for(let key in obj.properties)
                {
                    let index=arrDef.length;
                    let obj1=arguments.callee(obj.properties[key],root,arrDef);
                    arrDef.splice(index);
                    if(obj1!==null)
                    {
                        obj1=util.clone(obj1);
                        obj1.name=key;
                        objRaw.data.push(obj1);
                    }
                }
            }
            if(obj.description)
            {
                objRaw.remark=obj.description;
            }
            if(obj.default!==undefined)
            {
                objRaw.mock=obj.default;
            }
            if(obj.example!==undefined || obj.enum!==undefined)
            {
                objRaw.value={
                    type:0,
                    status:"",
                    data:[]
                };
                if(obj.example!==undefined)
                {
                    objRaw.value.data.push({
                        value:obj.example,
                        remark:""
                    })
                }
                if(obj.enum!==undefined)
                {
                    objRaw.value.data=objRaw.value.data.concat(obj.enum.map(function (obj) {
                        return {
                            value:obj,
                            remark:""
                        }
                    }));
                }
            }
            if(def.$ref)
            {
                objDef[key]=objRaw;
            }
            return objRaw;
        }
        if(obj.definitions)
        {
            for(let key in obj.definitions)
            {
                let val=obj.definitions[key];
                let arrDef=[key];
                let o=handleDef(val,obj.definitions,arrDef);
                objDef[key]=o;
            }
        }
        let arrMethod=["GET","POST","PUT","DELETE","PATCH"];
        for(let path in obj.paths)
        {
            let objInter;
            let obj1=obj.paths[path];
            for(let method in obj1)
            {
                let interRaw=obj1[method];
                if(arrMethod.indexOf(method.toUpperCase())==-1)
                {
                    continue;
                }
                let name;
                if(interRaw.summary)
                {
                    name=interRaw.summary
                }
                else
                {
                    name=path;
                    let index=name.lastIndexOf("/");
                    if(index>-1)
                    {
                        name=name.substr(index+1);
                    }
                }
                let query1:any={
                    project:objProject._id,
                    group:objGroup[interRaw.tags[0]]._id,
                    url:path,
                    method:method.toUpperCase()
                }
                if(objModel.objVersion)
                {
                    query1.version=objModel.objVersion._id;
                }
                objInter=await objModel.interfaceModel.findOne(query1);
                let update;
                if(objInter)
                {
                    update={
                        name:name,
                        method:objInter.method,
                        remark:interRaw.description?interRaw.description:objInter.remark,
                        param:[
                            {
                                before:{
                                    mode:0,
                                    code:""
                                },
                                after:{
                                    mode:0,
                                    code:""
                                },
                                name:"未命名",
                                remark:"",
                                id:uuid()
                            }
                        ],
                        $unset:{
                            delete:1
                        }
                    };
                }
                else
                {
                    update={
                        name:name,
                        project:objProject._id,
                        group:(interRaw.tags && objGroup[interRaw.tags[0]])?objGroup[interRaw.tags[0]]._id:objGroup["未命名"]._id,
                        url:path,
                        remark:interRaw.description,
                        method:method.toUpperCase(),
                        owner:userId,
                        editor:userId,
                        param:[
                            {
                                before:{
                                    mode:0,
                                    code:""
                                },
                                after:{
                                    mode:0,
                                    code:""
                                },
                                name:"未命名",
                                remark:"",
                                id:uuid(),
                                queryParam:[],
                                header:[],
                                restParam:[],
                                outInfo:{
                                    "rawMock" : "",
                                    "rawRemark" : "",
                                    "type" : 0
                                },
                                outParam:[],
                            }
                        ],
                        id:uuid()
                    };
                }
                let rest=[],query=[],header=[],body=[];
                let bodyInfo:any={
                    type:0,
                    rawType:0,
                    rawTextRemark:"",
                    rawFileRemark:"",
                    rawText:"",
                    rawJSON:[{
                        name:"",
                        must:1,
                        type:0,
                        remark:"",
                        show:1,
                        mock:"",
                        drag:1
                    }],
                    rawJSONType:0
                };
                let outInfo:any={
                    type:0,
                    rawRemark:"",
                    rawMock:"",
                    jsonType:0
                };
                let contentType=interRaw.consumes?interRaw.consumes[0]:null;
                if(!contentType)
                {
                    if(interRaw.parameters)
                    {
                        for(let obj of interRaw.parameters)
                        {
                            if(obj.in=="body" && obj.schema)
                            {
                                contentType="application/json";
                                break;
                            }
                        }
                    }
                }
                if(contentType)
                {
                    header.push({
                        name:"Content-Type",
                        value:contentType,
                        remark:""
                    });
                    if(contentType=="application/json")
                    {
                        bodyInfo={
                            type:1,
                            rawType:2,
                            rawTextRemark:"",
                            rawFileRemark:"",
                            rawText:"",
                            rawJSON:[{
                                name:"",
                                must:1,
                                type:0,
                                remark:"",
                                show:1,
                                mock:"",
                                drag:1
                            }],
                            rawJSONType:0
                        };
                    }
                }
                if(interRaw.parameters)
                {
                    for(let o of interRaw.parameters)
                    {
                        if(o.in=="path")
                        {
                            rest.push({
                                value:{
                                    "status" : "",
                                    "data" : [],
                                    "type" : 0
                                },
                                name:o.name,
                                remark:o.description?o.description:""
                            })
                        }
                        else if(o.in=="query")
                        {
                            query.push({
                                name:o.name,
                                remark:o.description?o.description:"",
                                must:o.required?1:0,
                                value:{
                                    "status" : "",
                                    "data" : (o.items && o.items.enum)?o.items.enum.map(function (obj) {
                                        return {
                                            value:obj.toString(),
                                            remark:""
                                        }
                                    }):(o.default?[{
                                        value:o.default.toString(),
                                        remark:""
                                    }]:[]),
                                    "type" : 0
                                }
                            })
                        }
                        else if(o.in=="header")
                        {
                            header.push({
                                name:o.name,
                                remark:o.description?o.description:"",
                                value:o.default?o.default:""
                            })
                        }
                        else if(o.in=="body")
                        {
                            if(bodyInfo.type==0)
                            {
                                let objBody={
                                    name:o.name,
                                    type:0,
                                    must:o.required?1:0,
                                    remark:o.description?o.description:""
                                };
                                body.push(objBody);
                            }
                            else if(bodyInfo.type==1 && bodyInfo.rawType==2)
                            {
                                let objBody:any={
                                    mock : "",
                                    remark : o.description,
                                    type : 1,
                                    must : o.required?1:0,
                                    name :o.name
                                };
                                if(o.schema)
                                {
                                    if(o.schema.$ref)
                                    {
                                        let key=o.schema.$ref.substr(14);
                                        if(objDef[key])
                                        {
                                            let o1=util.clone(objDef[key]);
                                            o1.remark=objBody.remark;
                                            o1.must=objBody.must;
                                            o1.name=objBody.name;
                                            objBody=o1;
                                            if(bodyInfo.rawJSON[0].name)
                                            {
                                                bodyInfo.rawJSON.push(objBody);
                                            }
                                            else
                                            {
                                                bodyInfo.rawJSON[0]=objBody;
                                            }
                                        }
                                    }
                                    else
                                    {
                                        if(o.schema.items)
                                        {
                                            objBody.data=[];
                                            objBody.type=3;
                                            if(o.schema.items.$ref)
                                            {
                                                let key=o.schema.items.$ref.substr(14);
                                                if(objDef[key])
                                                {
                                                    let o1=util.clone(objDef[key]);
                                                    objBody.data.push(o1);
                                                    if(bodyInfo.rawJSON[0].name)
                                                    {
                                                        bodyInfo.rawJSON.push(objBody);
                                                    }
                                                    else
                                                    {
                                                        bodyInfo.rawJSON[0]=objBody;
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                let type;
                                                let o1=o.schema.items;
                                                if(o1.type=="string" || o1.type=="byte" || o1.type=="binary" || o1.type=="date" || o1.type=="dateTime" || o1.type=="password")
                                                {
                                                    type=0;
                                                }
                                                else if(o1.type=="integer" || o1.type=="long" || o1.type=="float" || o1.type=="double")
                                                {
                                                    type=1;
                                                }
                                                else if(o1.type=="boolean")
                                                {
                                                    type=2;
                                                }
                                                let o2={
                                                    mock : o1.default!==undefined?o1.default:"",
                                                    remark : o1.description?o1.description:"",
                                                    type : type,
                                                    must : 1,
                                                    name :null
                                                }
                                                objBody.data.push(o2);
                                                if(bodyInfo.rawJSON[0].name)
                                                {
                                                    bodyInfo.rawJSON.push(objBody);
                                                }
                                                else
                                                {
                                                    bodyInfo.rawJSON[0]=objBody;
                                                }
                                            }
                                        }
                                        else if(o.schema.type=="cust" && o.schema.format=="json")
                                        {
                                            objBody.data=[];
                                            objBody.type=3;
                                            let objJSON;
                                            try {
                                                objJSON=JSON.parse(o.schema.content);
                                            }
                                            catch (err)
                                            {
                                                continue;
                                            }
                                            let result=[];
                                            for(let key in objJSON)
                                            {
                                                util.handleResultData(key,objJSON[key],result,null,1,1)
                                            }
                                            objBody.data=result;
                                            if(bodyInfo.rawJSON[0].name)
                                            {
                                                bodyInfo.rawJSON.push(objBody);
                                            }
                                            else
                                            {
                                                bodyInfo.rawJSON[0]=objBody;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if(o.in=="formData")
                        {
                            let objBody={
                                name:o.name,
                                type:o.type!="file"?0:1,
                                must:o.required?1:0,
                                remark:o.description?o.description:""
                            };
                            body.push(objBody);
                            header["Content-Type"]="multipart/form-data";
                        }
                    }
                }
                if(interRaw.responses)
                {
                    let count=0;
                    for(let status in interRaw.responses)
                    {
                        count++;
                        let result=[];
                        let objRes=interRaw.responses[status];
                        if(objRes.schema && objRes.schema.$ref)
                        {
                            let key=objRes.schema.$ref.substr(14);
                            if(objDef[key])
                            {
                                let o1=util.clone(objDef[key]);
                                if(o1.type==4)
                                {
                                    result=o1.data;
                                }
                                else
                                {
                                    outInfo.type=1;
                                    outInfo.rawMock=o1.mock?o1.mock:"";
                                    outInfo.rawRemark=objRes.description?objRes.description:"";
                                }
                            }
                        }
                        else if(objRes.schema && objRes.schema.items)
                        {
                            outInfo.jsonType=1;
                            result=[
                                {
                                    name:null,
                                    must:1,
                                    type:0,
                                    remark:"",
                                    mock:"",
                                }
                            ]
                            if(objRes.schema.items.$ref)
                            {
                                let key=objRes.schema.items.$ref.substr(14);
                                if(objDef[key])
                                {
                                    let o1=util.clone(objDef[key]);
                                    if(o1.type==4)
                                    {
                                        result[0].type=4;
                                        result[0].data=o1.data;
                                    }
                                    else
                                    {
                                        for(let key in o1)
                                        {
                                            result[0][key]=o1[key];
                                        }
                                    }
                                }
                            }
                            else
                            {
                                let type;
                                let o1=objRes.schema.items;
                                if(o1.type=="string" || o1.type=="byte" || o1.type=="binary" || o1.type=="date" || o1.type=="dateTime" || o1.type=="password")
                                {
                                    type=0;
                                }
                                else if(o1.type=="integer" || o1.type=="long" || o1.type=="float" || o1.type=="double")
                                {
                                    type=1;
                                }
                                else if(o1.type=="boolean")
                                {
                                    type=2;
                                }
                                result[0].type=type;
                            }
                        }
                        else if(objRes.schema && objRes.schema.properties)
                        {
                            function __handleRes(key,value,data) {
                                let obj:any={
                                    mock : value.example?value.example:"",
                                    remark : value.description?value.description:"",
                                    type : 0,
                                    must : 1,
                                    name :key?key:null
                                }
                                if(value.type=="string" || value.type=="byte" || value.type=="binary" || value.type=="date" || value.type=="dateTime" || value.type=="password")
                                {
                                    obj.type=0;
                                }
                                else if(value.type=="integer" || value.type=="long" || value.type=="float" || value.type=="double")
                                {
                                    obj.type=1;
                                }
                                else if(value.type=="boolean")
                                {
                                    obj.type=2;
                                }
                                else if(value.type=="array")
                                {
                                    obj.type=3;
                                    obj.data=[];
                                    if(value.items.$ref)
                                    {
                                        let result:any=[
                                            {
                                                name:null,
                                                must:1,
                                                type:0,
                                                remark:"",
                                                mock:"",
                                            }
                                        ]
                                        let def=value.items.$ref.substr(value.items.$ref.lastIndexOf("/")+1);
                                        if(objDef[def])
                                        {
                                            let o1=util.clone(objDef[def]);
                                            if(o1.type==4)
                                            {
                                                result[0].type=4;
                                                result[0].data=o1.data;
                                            }
                                            else
                                            {
                                                for(let key in o1)
                                                {
                                                    result[0][key]=o1[key];
                                                }
                                            }
                                            obj.data=result;
                                        }
                                    }
                                    else
                                    {
                                        let type;
                                        let o1=value.items;
                                        arguments.callee(null,o1,obj.data);
                                    }
                                }
                                else if(value.type=="object")
                                {
                                    obj.type=4;
                                    obj.data=[];
                                    for(let k in value.properties)
                                    {
                                        arguments.callee(k,value.properties[k],obj.data);
                                    }
                                }
                                else if(value.$ref)
                                {
                                    let ref=value.$ref.substr(value.$ref.lastIndexOf("/")+1);
                                    if(objDef[ref])
                                    {
                                        let o1=util.clone(objDef[ref]);
                                        if(o1.type==4)
                                        {
                                            obj.type=4;
                                            obj.data=o1.data;
                                        }
                                        else
                                        {
                                            for(let key in o1)
                                            {
                                                obj[key]=o1[key];
                                            }
                                        }
                                    }
                                }
                                data.push(obj);
                            }
                            for(let key in objRes.schema.properties)
                            {
                                __handleRes(key,objRes.schema.properties[key],result);
                            }
                        }
                        else if(objRes.schema && objRes.schema.type=="cust" && objRes.schema.format=="json")
                        {
                            let objJSON;
                            try {
                                objJSON=JSON.parse(objRes.schema.content);
                            }
                            catch (err)
                            {

                            }
                            if(objJSON)
                            {
                                let result1=[];
                                for(let key in objJSON)
                                {
                                    util.handleResultData(key,objJSON[key],result1,null,1)
                                }
                                result=result1;
                            }
                        }
                        else
                        {
                            outInfo.type=1;
                            if(objRes.schema)
                            {
                                outInfo.rawRemark=objRes.description+"("+(objRes.schema.type?objRes.schema.type:"")+")";
                            }
                            else
                            {
                                outInfo.rawRemark=""
                            }
                        }
                        let objParam:any={
                            name:status,
                            remark:objRes.description?objRes.description:"",
                            id:uuid(),
                            before:{
                                code:"",
                                mode:0
                            },
                            after:{
                                code:"",
                                mode:0
                            }
                        };
                        objParam.restParam=rest;
                        objParam.queryParam=query;
                        objParam.header=header;
                        objParam.outParam=result;
                        objParam.outInfo=outInfo;
                        if(update.method=="POST" || update.method=="PUT" || update.method=="PATCH")
                        {
                            objParam.bodyParam=body;
                            objParam.bodyInfo=bodyInfo;
                        }
                        if(count==1)
                        {
                            update.param[0]=util.clone(objParam)
                        }
                        else
                        {
                            update.param.push(util.clone(objParam))
                        }
                    }
                }
                if(objInter)
                {
                    await objModel.interfaceModel.findOneAndUpdate({
                        _id:objInter._id
                    },update)
                }
                else
                {
                    await objModel.interfaceModel.create(update);
                }
            }
        }

    }

    async importPostman (json:string,baseurl:string,ignore:number,userId:string,ctx=ctxFake){

        let obj=JSON.parse(json);
        var projectID,groupID;
        var arr=baseurl.split(",");
        var update:any={
            name:obj.info.name,
            dis:obj.info.description?obj.info.description:"",
            owner:userId,
            source:{
                type:2
            },
            baseUrls:arr.map(function (obj) {
                return {
                    url:obj,
                    remark:"",
                    env:[]
                }
            })
        };
        let baseUrls=update.baseUrls;
        if(ctx.headers["docleverversion"])
        {
            update.version=ctx.headers["docleverversion"]
        }
        var insertDate,interfaceCount=0;
        let objProject=await project.create(update);
        await group.create({
            name:"#回收站",
            project:objProject._id,
            type:1,
            id:uuid()
        })
        insertDate=objProject;
        projectID=objProject._id;
        var indexInterface=0,defaultGroupId;
        let _map=async function (obj,groupParent?) {
            for(let grp of obj.item)
            {
                if(grp.request)
                {
                    if(!groupParent)
                    {
                        if(defaultGroupId)
                        {
                            groupID=defaultGroupId;
                        }
                        else
                        {
                            let o=await group.create({
                                name:"未命名",
                                project:projectID,
                                type:0,
                                id:uuid()
                            })
                            groupID=defaultGroupId=o._id;
                        }
                    }
                    else
                    {
                        groupID=groupParent._id;
                    }
                    indexInterface++;
                    interfaceCount++
                    let obj;
                    if(typeof(grp.request.url)=="object")
                    {
                        let objUrl=util.parseURL(grp.request.url.raw);
                        let url=objUrl.source;
                        util.getPostmanGlobalVar(url,baseUrls);
                        let index=url.indexOf("?");
                        if(index>-1)
                        {
                            url=url.substr(0,index);
                        }
                        for(var i=0;i<arr.length;i++)
                        {
                            if(ignore)
                            {
                                index=url.toLowerCase().indexOf(arr[i].toLowerCase());
                            }
                            else
                            {
                                index=url.indexOf(arr[i]);
                            }
                            if(index>-1)
                            {
                                url=url.substr(index+arr[i].length);
                                break;
                            }
                        }
                        if(grp.request.url.path)
                        {
                            grp.request.url.path.forEach(function (obj) {
                                if(obj[0]==":")
                                {
                                    url=url.replace(obj,"{"+obj.substr(1)+"}");
                                }
                            })
                        }
                        obj={
                            name:grp.name,
                            url:url,
                            group:groupID,
                            remark:grp.request.description,
                            project:projectID,
                            method:grp.request.method,
                            finish:1,
                            param:[{
                                before:{
                                    mode:0,
                                    code:""
                                },
                                after:{
                                    mode:0,
                                    code:""
                                },
                                name:"未命名",
                                remark:"",
                                id:uuid()
                            }],
                            id:uuid(),
                            owner:userId,
                            editor:userId,
                            before:{
                                code:"",
                                mode:0
                            },
                            after:{
                                code:"",
                                mode:0
                            }
                        };
                        let restParam=[];
                        if(grp.request.url.variable)
                        {
                            grp.request.url.variable.forEach(function (obj) {
                                restParam.push({
                                    name:obj.key,
                                    remark:obj.description,
                                    value:{
                                        "status" : "",
                                        "data" : obj.value?[obj.value]:[],
                                        "type" : 0
                                    }
                                })
                            })
                        }
                        obj.param[0].restParam=restParam;
                        let param=[];
                        for(let key in objUrl.params)
                        {
                            let v:any={
                                name:key,
                                must:1,
                                remark:""
                            };
                            if(objUrl.params[key]!=="" && objUrl.params[key]!==undefined)
                            {
                                util.getPostmanGlobalVar(objUrl.params[key],baseUrls);
                                v.value={
                                    status:"",
                                    type:0,
                                    data:[
                                        {
                                            value:objUrl.params[key],
                                            remark:""
                                        }
                                    ]
                                };
                            }
                            param.push(v);
                        }
                        obj.param[0].queryParam=param;
                    }
                    else
                    {
                        let objUrl=util.parseURL(grp.request.url);
                        let url=objUrl.source,index=url.indexOf("?");
                        util.getPostmanGlobalVar(url,baseUrls);
                        if(index>-1)
                        {
                            url=url.substr(0,index);
                        }
                        for(let i=0;i<arr.length;i++)
                        {
                            if(ignore)
                            {
                                index=url.toLowerCase().indexOf(arr[i].toLowerCase());
                            }
                            else
                            {
                                index=url.indexOf(arr[i]);
                            }
                            if(index>-1)
                            {
                                url=url.substr(index+arr[i].length);
                                break;
                            }
                        }
                        obj={
                            name:grp.name,
                            url:url,
                            group:groupID,
                            remark:grp.request.description,
                            project:projectID,
                            method:grp.request.method,
                            finish:1,
                            param:[{
                                before:{
                                    mode:0,
                                    code:""
                                },
                                after:{
                                    mode:0,
                                    code:""
                                },
                                name:"未命名",
                                remark:"",
                                id:uuid()
                            }],
                            id:uuid(),
                            owner:userId,
                            editor:userId,
                            before:{
                                code:"",
                                mode:0
                            },
                            after:{
                                code:"",
                                mode:0
                            }
                        };
                        let param=[];
                        for(let key in objUrl.params)
                        {
                            let v:any={
                                name:key,
                                must:1,
                                remark:""
                            };
                            if(objUrl.params[key]!=="" && objUrl.params[key]!==undefined)
                            {
                                util.getPostmanGlobalVar(objUrl.params[key],baseUrls);
                                v.value={
                                    status:"",
                                    type:0,
                                    data:[
                                        {
                                            value:objUrl.params[key],
                                            remark:""
                                        }
                                    ]
                                };
                            }
                            param.push(v);
                        }
                        obj.param[0].queryParam=param;
                        obj.param[0].restParam=[];
                        let arrMatch=url.match(/(\/):(.+?)(?=\b|\?|#|\/)/g);
                        if(arrMatch && arrMatch.length>0)
                        {
                            arrMatch.forEach(function (obj1) {
                                obj.param[0].restParam.push({
                                    value:{
                                        "status" : "",
                                        "data" : [],
                                        "type" : 0
                                    },
                                    name:obj1.substr(2),
                                    remark:""
                                })
                            })
                            obj.url=obj.url.replace(/(\/):(.+?)(?=\b|\?|#|\/)/g,"$1{$2}");
                        }
                    }
                    let bJSON=false;
                    obj.param[0].header=grp.request.header.map(function (obj) {
                        if(obj.key.toLowerCase()=="content-type" && obj.value.toLowerCase().indexOf("application/json")>-1)
                        {
                            bJSON=true;
                        }
                        util.getPostmanGlobalVar(obj.value,baseUrls);
                        return {
                            name:obj.key,
                            value:obj.value,
                            remark:""
                        }
                    })
                    if(obj.method.toLowerCase()=="post" || obj.method.toLowerCase()=="put" || obj.method.toLowerCase()=="patch")
                    {
                        let body,bodyInfo;
                        if(grp.request.body.mode=="urlencoded" || grp.request.body.mode=="formdata")
                        {
                            bodyInfo={
                                type:0,
                                rawType:0,
                                rawTextRemark:"",
                                rawFileRemark:"",
                                rawText:"",
                            };
                            body=grp.request.body[grp.request.body.mode].map(function (obj)
                            {
                                let o:any={
                                    name:obj.key,
                                    type:obj.type=="text"?0:1,
                                    must:1,
                                    remark:"",
                                }
                                if(o.type==0 && obj.value!=="" && obj.value!==undefined)
                                {
                                    util.getPostmanGlobalVar(obj.value,baseUrls);
                                    o.value={
                                        status:"",
                                        type:0,
                                        data:[
                                            {
                                                value:obj.value,
                                                remark:""
                                            }
                                        ]
                                    };
                                }
                                return o;
                            })
                        }
                        else if(grp.request.body.mode=="raw")
                        {
                            body=[];
                            if(bJSON)
                            {
                                let objJSON,bSuccess;
                                try {
                                    util.getPostmanGlobalVar(grp.request.body.raw,baseUrls);
                                    objJSON=eval("("+grp.request.body.raw+")");
                                    bSuccess=true;
                                }
                                catch (err)
                                {
                                    bSuccess=false;
                                }
                                if(!bSuccess)
                                {
                                    let str=grp.request.body.raw;
                                    str=str.replace(/(\{\{.+?\}\})/g,"\"$1\"");
                                    try {
                                        objJSON=eval("("+str+")");
                                    }
                                    catch (err)
                                    {

                                    }
                                }
                                if(objJSON)
                                {
                                    let result=[];
                                    for(let key in objJSON)
                                    {
                                        util.handleResultData(key,objJSON[key],result,null,1)
                                    }
                                    bodyInfo={
                                        type:1,
                                        rawType:2,
                                        rawTextRemark:"",
                                        rawFileRemark:"",
                                        rawText:"",
                                        rawJSON:result
                                    };
                                }
                                else
                                {
                                    bodyInfo={
                                        type:1,
                                        rawType:0,
                                        rawTextRemark:"",
                                        rawFileRemark:"",
                                        rawText:grp.request.body.raw,
                                    };
                                }
                            }
                            else
                            {
                                util.getPostmanGlobalVar(grp.request.body.raw,baseUrls);
                                bodyInfo={
                                    type:1,
                                    rawType:0,
                                    rawTextRemark:"",
                                    rawFileRemark:"",
                                    rawText:grp.request.body.raw,
                                };
                            }
                        }
                        else
                        {
                            body=[];
                            bodyInfo={
                                type:0,
                                rawType:0,
                                rawTextRemark:"",
                                rawFileRemark:"",
                                rawText:"",
                            };
                        }
                        obj.param[0].bodyParam=body;
                        obj.param[0].bodyInfo=bodyInfo
                    }
                    obj.param[0].outParam=[];
                    obj.param[0].outInfo={
                        type:0,
                        rawRemark:"",
                        rawMock:"",
                    };
                    await interfaceModel.create(obj);
                }
                else
                {
                    let createGroup=async function () {
                        var groupName;
                        groupName=grp.name;
                        let query:any={
                            name:groupName,
                            project:projectID,
                            type:0,
                            id:uuid()
                        };
                        if(groupParent)
                        {
                            query.parent=groupParent.id;
                        }
                        let objGroup=await group.create(query);
                        return objGroup;
                    }
                    let objGroup=await createGroup();
                    if(grp.item && grp.item.length>0)
                    {
                        await _map(grp,objGroup)
                    }
                }
            }
        }
        await _map(obj);
        await project.update({
            _id:objProject._id
        },{
            baseUrls:baseUrls
        });
        objProject._doc.role=0;
        objProject._doc.userCount=1;
        objProject._doc.interfaceCount=interfaceCount;
        objProject._doc.own=1;
        return objProject

    }

    async exportDocx (id:string,versionId:string,userId:string,ctx){
        let objModel=await this.inProject(ctx.headers["dovleverversion"],ctx.headers["referer"],id,versionId,userId)
        var docx=office("docx");
        let func=async function(id,obj) {
            let query:any={
                project:id,
                parent:obj?obj.id:{
                    $exists:false
                }
            }
            if(versionId)
            {
                query.version=versionId
            }
            let arr=await objModel.groupModel.find(query,null)
            for(let obj of arr)
            {
                await func(id,obj);
            }
            if(obj)
            {
                let arrInterface=await objModel.interfaceModel.find({
                    group:obj._id
                },null);
                for(let o of arrInterface)
                {
                    handleDoc(o);
                }
            }
        }
        function handleDoc(obj) {
            var pObj = docx.createP ({
                align:"center"
            });
            pObj.addText(obj.name,{
                font_size:20
            });
            pObj=docx.createP();
            pObj.addLineBreak();
            pObj.addText(`method:${obj.method}`,{
                font_size:18
            });
            pObj.addLineBreak();
            pObj.addText(`path:${obj.url}`,{
                font_size:18
            });
            pObj.addLineBreak();
            pObj.addText(`status:${obj.finish==1?"开发完成":(obj.finish==2?"已废弃":"未完成")}`,{
                font_size:18
            });
            pObj.addLineBreak();
            pObj.addText(`reamrk:${obj.remark}`,{
                font_size:18
            });
            pObj.addLineBreak();
            for(let o of obj.param)
            {
                pObj=docx.createP();
                pObj.addText(`参数实例:${o.name}`,{
                    font_size:18,
                    bold:true
                });
                pObj.addLineBreak();
                if(o.restParam.length>0)
                {
                    pObj=docx.createP();
                    pObj.addText(`Rest Param:`,{
                        font_size:18
                    });
                    pObj.addLineBreak();
                    let table = [
                        [{
                            val: "名称",
                            opts: {
                                b:true,
                                sz: '24',
                                shd: {
                                    fill: "7F7F7F",
                                    themeFill: "text1",
                                    "themeFillTint": "80"
                                },
                                fontFamily: "Avenir Book"
                            }
                        },{
                            val: "备注",
                            opts: {
                                align: "center",
                                vAlign: "center",
                                b:true,
                                sz: '24',
                                shd: {
                                    fill: "92CDDC",
                                    themeFill: "text1",
                                    "themeFillTint": "80"
                                }
                            }
                        }]
                    ];
                    o.restParam.forEach(function (obj) {
                        table.push([
                            obj.name,
                            obj.remark?obj.remark:""
                        ])
                    })
                    let tableStyle = {
                        tableColWidth: 4261,
                        tableSize: 24,
                        tableColor: "ada",
                        tableAlign: "center",
                        tableFontFamily: "Comic Sans MS",
                        borders: true
                    }
                    docx.createTable(table,tableStyle);
                }
                if(o.queryParam.length>0)
                {
                    pObj=docx.createP();
                    pObj.addText(`Query:`,{
                        font_size:18
                    });
                    pObj.addLineBreak();
                    let table = [
                        [{
                            val: "名称",
                            opts: {
                                b:true,
                                sz: '24',
                                shd: {
                                    fill: "7F7F7F",
                                    themeFill: "text1",
                                    "themeFillTint": "80"
                                },
                                fontFamily: "Avenir Book"
                            }
                        },{
                            val: "是否必填",
                            opts: {
                                b:true,
                                sz: '24',
                                shd: {
                                    fill: "7F7F7F",
                                    themeFill: "text1",
                                    "themeFillTint": "80"
                                },
                                fontFamily: "Avenir Book"
                            }
                        },{
                            val: "备注",
                            opts: {
                                align: "center",
                                vAlign: "center",
                                b:true,
                                sz: '24',
                                shd: {
                                    fill: "92CDDC",
                                    themeFill: "text1",
                                    "themeFillTint": "80"
                                }
                            }
                        }]
                    ];
                    o.queryParam.forEach(function (obj) {
                        table.push([
                            obj.name,
                            obj.must?"必填":"选填",
                            obj.remark?obj.remark:""
                        ])
                    })
                    let tableStyle = {
                        tableColWidth: 4261,
                        tableSize: 24,
                        tableColor: "ada",
                        tableAlign: "center",
                        tableFontFamily: "Comic Sans MS",
                        borders: true
                    }
                    docx.createTable(table,tableStyle);
                }
                if(obj.method=="POST" || obj.method=="PUT" || obj.method=="PATCH")
                {
                    pObj=docx.createP();
                    if(o.bodyInfo.type==0)
                    {
                        if(o.bodyParam.length>0)
                        {
                            pObj.addText(`Body:`,{
                                font_size:18
                            });
                            pObj.addLineBreak();
                            let table = [
                                [{
                                    val: "名称",
                                    opts: {
                                        b:true,
                                        sz: '24',
                                        shd: {
                                            fill: "7F7F7F",
                                            themeFill: "text1",
                                            "themeFillTint": "80"
                                        },
                                        fontFamily: "Avenir Book"
                                    }
                                },{
                                    val: "类型",
                                    opts: {
                                        b:true,
                                        sz: '24',
                                        shd: {
                                            fill: "7F7F7F",
                                            themeFill: "text1",
                                            "themeFillTint": "80"
                                        },
                                        fontFamily: "Avenir Book"
                                    }
                                },{
                                    val: "是否必填",
                                    opts: {
                                        b:true,
                                        sz: '24',
                                        shd: {
                                            fill: "7F7F7F",
                                            themeFill: "text1",
                                            "themeFillTint": "80"
                                        },
                                        fontFamily: "Avenir Book"
                                    }
                                },{
                                    val: "备注",
                                    opts: {
                                        align: "center",
                                        vAlign: "center",
                                        b:true,
                                        sz: '24',
                                        shd: {
                                            fill: "92CDDC",
                                            themeFill: "text1",
                                            "themeFillTint": "80"
                                        }
                                    }
                                }]
                            ];
                            o.bodyParam.forEach(function (obj) {
                                table.push([
                                    obj.name,
                                    obj.type==0?"文本":"文件",
                                    obj.must?"必填":"选填",
                                    obj.remark?obj.remark:""
                                ])
                            })
                            let tableStyle = {
                                tableColWidth: 4261,
                                tableSize: 24,
                                tableColor: "ada",
                                tableAlign: "center",
                                tableFontFamily: "Comic Sans MS",
                                borders: true
                            }
                            docx.createTable(table,tableStyle);
                        }
                    }
                    else
                    {
                        if(o.bodyInfo.rawType==2)
                        {
                            let result=o.bodyInfo.rawJSONType==1?[]:{};
                            util.convertToJSON(o.bodyInfo.rawJSON,result);
                            let str=util.formatJson(result);
                            pObj.addText(`Body JSON:`,{
                                font_size:18
                            });
                            pObj.addLineBreak();
                            pObj.addText(str,{
                                back:"F0F1F2",
                                border: 'dotted',
                                borderSize: 2,
                                borderColor: '88CCFF'
                            })
                        }

                    }
                }
                if(o.outInfo.type==0)
                {
                    pObj=docx.createP();
                    let result=o.outInfo.rawJSONType==1?[]:{};
                    util.convertToJSON(o.outParam,result);
                    let str=util.formatJson(result);
                    pObj.addText(`Result JSON:`,{
                        font_size:18
                    });
                    pObj.addLineBreak();
                    pObj.addText(str,{
                        back:"F0F1F2",
                        border: 'dotted',
                        borderSize: 2,
                        borderColor: '88CCFF'
                    })
                }
                else
                {
                    pObj=docx.createP();
                    pObj.addText(`Result Raw:${o.outInfo.rawRemark}`,{
                        font_size:18
                    });
                }
            }
            pObj=docx.createP();
            pObj.addHorizontalLine();
        }
        await func(id,null);
        ctx.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename*=UTF-8\'\''+encodeURIComponent(objModel.objProject.name)+".docx",
            "Transfer-Encoding": "chunked",
            "Expires":0,
            "Cache-Control":"must-revalidate, post-check=0, pre-check=0",
            "Content-Transfer-Encoding":"binary",
            "Pragma":"public",
        });
        docx.generate(ctx.res);

    }
}

export=new ProjectDao
