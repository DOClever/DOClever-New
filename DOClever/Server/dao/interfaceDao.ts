/**
 * Created by sunxin on 2016/11/20.
 */


import e=require("../util/error.json");
import util=require("../util/util");
import userModel=require("../model/userModel")
import project=require("../model/projectModel")
import group=require("../model/groupModel")
import groupVersion=require("../model/groupVersionModel")
import interfaceModel=require("../model/interfaceModel")
import interfaceVersion=require("../model/interfaceVersionModel")
import interfaceSnapshot=require("../model/interfaceSnapshotModel")
import version=require("../model/versionModel")
import teamGroup=require("../model/teamGroupModel")
import example=require("../model/exampleModel")
import doc=require("../model/docModel")
import uuid=require("uuid");
import {api, user} from "../routes/generateParams";
import interfaceApi = require("../../Common/routes/interface")
import {keys} from "../../Common/transform";
import {ctxFake, IInterfaceValidateUserRet} from "./types";
import {
    GroupModel,
    GroupVersionModel,
    InterfaceModel,
    InterfaceSnapshotModel,
    InterfaceVersionModel, UserModel
} from "../model/types";
import {InstanceType} from "typegoose";
class InterfaceDao {
    async sort (projectId:string,docleverVersion:string,interfaceCurModel:typeof interfaceModel | typeof interfaceVersion,groupModel:typeof group|typeof groupVersion,objGroup:InstanceType<GroupModel>|InstanceType<GroupVersionModel>,objMove:InstanceType<GroupModel>|InstanceType<GroupVersionModel>|InstanceType<InterfaceModel>|InstanceType<InterfaceVersionModel>,index:number,bGroup:boolean){
        let arr=[];
        if(bGroup)
        {
            let query:any={
                project:projectId
            };
            if(objGroup)
            {
                query.parent=objGroup.id;
            }
            else
            {
                query.parent={
                    $exists:false
                }
            }
            if(docleverVersion)
            {
                query.version=docleverVersion
            }
            arr=await groupModel.find(query,null,{
                sort:"sort"
            })
        }
        else
        {
            let query:any={
                project:projectId,
                group:objGroup._id
            };
            if(docleverVersion)
            {
                query.version=docleverVersion
            }
            arr=await (<any>interfaceCurModel).find(query,null,{
                sort:"sort"
            })

        }
        for(let i=0;i<arr.length;i++)
        {
            let obj=arr[i];
            if(obj._id.toString()==objMove._id.toString())
            {
                arr.splice(i,1);
                break;
            }
        }
        arr.splice(index,0,objMove);
        for(let i=0;i<arr.length;i++)
        {
            let obj=arr[i];
            obj.sort=i;
            await obj.save();
        }
    }
    async getChild(docleverVersion:string,cookieSort:number,interfaceCurModel:typeof interfaceModel | typeof interfaceVersion,groupModel:typeof group|typeof groupVersion,projectId:string,obj:GroupModel|GroupVersionModel,bInter:boolean){
        let query:any={
            project:projectId,
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
        let arr:(InstanceType<GroupModel>|InstanceType<GroupVersionModel>|InstanceType<InterfaceModel>|InstanceType<InterfaceVersionModel>)[]=await groupModel.find(query,null,{
            sort:sort
        })
        for(let obj of arr)
        {
            obj._doc.data=await this.getChild(docleverVersion,cookieSort,interfaceCurModel,groupModel,projectId,obj as GroupModel|GroupVersionModel,bInter);
        }
        if(bInter && obj)
        {
            let arrInterface=await (<any>interfaceCurModel).find({
                group:obj._id
            },"_id name method finish url delete",{
               sort:sort
            });
            arr=arr.concat(arrInterface);
        }
        return arr;
    }
    async validateUser (docleverVersion:string,docleverSnapshot:string,referer:string,id:string,projectId:string,groupId:string,userId:string){
        let ret=<IInterfaceValidateUserRet>{}
        let obj, pro;
        ret.interfaceModel = interfaceModel;
        ret.groupModel = group;
        if (docleverVersion) {
            let objVersion = await version.findOne({
                _id: docleverVersion
            })
            if (!objVersion) {
                throw e.versionInvalidate;
            }
            ret.interfaceModel = interfaceVersion;
            ret.groupModel = groupVersion;
        }
        if (docleverSnapshot) {
            ret.interfaceModel = interfaceSnapshot;
        }
        if (id) {
            let obj = await (<any>ret.interfaceModel).findOne(id.length == 24 ? {
                _id: id
            } : {
                id: id,
                project: projectId
            });
            if (!obj) {
                throw e.interfaceNotFound;
            }
            ret.objInterface = obj;
            pro = obj.project;
        }
        else {
            pro = projectId;
        }
        if (pro) {
            obj = await project.findOne({
                _id: pro,
                $or: [
                    {
                        owner: userId
                    },
                    {
                        "users.user": userId
                    }
                ]
            })
            if (!obj) {
                obj = await project.findOne({
                    _id: pro
                });
                if (!obj) {
                    throw e.projectNotFound;
                    return;
                }
                if (obj.team) {
                    let arrUser = await teamGroup.find({
                        team: obj.team,
                        users: {
                            $elemMatch: {
                                user: userId,
                                role: {
                                    $in: [0, 2]
                                }
                            }
                        }
                    })
                    if (arrUser.length == 0 && !obj.public && referer && !referer.endsWith("public/public.html")) {
                        throw e.userForbidden;
                        return;
                    }
                }
                else if(!obj.public && referer && !referer.endsWith("public/public.html"))
                {
                    throw e.userForbidden;
                    return;
                }
            }
            ret.objProject = obj;
            let access:number
            if (obj.owner.toString() == userId) {
                access = 1;
            }
            else {
                for (let o of obj.users) {
                    if (o.user.toString() == userId) {
                        if (o.role == 0) {
                            access = 1;
                        }
                        else {
                            access = 0;
                        }
                        break;
                    }
                }
            }
        }
        if (groupId) {
            let g = await ret.groupModel.findOne({
                _id: groupId
            });
            if (!g) {
                throw e.groupNotFound
            }
            else {
                ret.objGroup = g;
                if(projectId)
                {
                    if(ret.objGroup.project.toString()!=projectId)
                    {
                        throw e.systemReason
                    }
                }
            }
        }
        return ret
    }



    async create (id:string,project:string,url:string,method:string,param:any,autosave:string,groupId:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,project,groupId,userId);
        let query:any={
            url:url,
            method:method,
            project:objModel.objProject._id
        }
        if(id)
        {
            query._id={
                $ne:id
            }
        }
        if (ctx.headers["docleverversion"]) {
            query.version = ctx.headers["docleverversion"]
        }
        let bDuplicate=false;
        let obj=await (objModel.interfaceModel as any).findOne(query);
        if(obj)
        {
            bDuplicate=true;
        }
        let update :any= {};
        for (let key in param) {
            if (key != "id" && param[key] !== undefined) {
                if (key == "param") {
                    if (param[key] !== "") {
                        update[key] = JSON.parse(param[key]);
                    }
                }
                else {
                    update[key] = param[key];
                }

            }
        }
        if (id) {
            update.editor = userId;
            if (ctx.headers["docleversnapshot"]) {
                update.snapshot = decodeURIComponent(ctx.headers["docleversnapshotdis"]);
            }
            let obj = await objModel.interfaceModel.findOneAndUpdate({
                _id: id
            }, update, {
                new: false
            });
            let arr=update.param.map(function (obj) {
                return obj.id;
            })
            await example.remove({
                interface:id,
                paramId:{
                    $nin:arr
                }
            })
            if (groupId && !autosave) {
                if (obj.group.toString() != groupId) {
                    if (objModel.interfaceModel != interfaceSnapshot) {
                        let query :any= {
                            id: obj.id,
                            project: obj.project
                        };
                        if (ctx.headers["docleverversion"]) {
                            query.version = ctx.headers["docleverversion"]
                        }
                        else {
                            query.version = {
                                $exists: false
                            }
                        }
                        await interfaceSnapshot.update(query, {
                            group: groupId
                        });
                    }
                    let arr = await this.getChild(ctx.headers["docleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel as (typeof interfaceModel|typeof  interfaceVersion),objModel.groupModel,obj.project.toString(), null,true)
                    return arr;
                }
            }
            return String(obj._id)
        }
        else
        {
            update.owner = userId;
            update.editor = userId;
            update.id = uuid();
            if (ctx.headers["docleverversion"]) {
                update.version = ctx.headers["docleverversion"]
            }
            let obj = await objModel.interfaceModel.create(update)
            return obj
        }
    }



    async remove (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,null,userId);
        let query:any = {
            project: objModel.objProject._id,
            type: 1
        }
        if (ctx.headers["docleverversion"]) {
            query.version = ctx.headers["docleverversion"]
        }
        let obj = await objModel.groupModel.findOne(query)
        objModel.objInterface.group = obj._id;
        await (objModel.objInterface as any).save()
        query = {
            id: objModel.objInterface.id,
            project: objModel.objProject._id
        };
        if (ctx.headers["docleverversion"]) {
            query.version = ctx.headers["docleverversion"]
        }
        else {
            query.version = {
                $exists: false
            }
        }
        await interfaceSnapshot.update(query, {
            group: obj._id
        });
        let arr = await this.getChild(ctx.headers["docleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel as (typeof interfaceModel|typeof  interfaceVersion),objModel.groupModel,objModel.objProject._id.toString(), null,true);
        return arr
    }



    async move (id:string,groupId:string,index:number,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,groupId,userId);
        if (ctx.headers["docleversnapshot"]) {
            throw e.systemReason;
        }
        let update :any= {};
        update.group = objModel.objGroup._id;
        let obj=await objModel.interfaceModel.findOneAndUpdate({
            _id: id
        }, update,{
            new:true
        })
        let query:any = {
            id: objModel.objInterface.id,
            project: objModel.objProject._id
        };
        if (ctx.headers["docleverversion"]) {
            query.version = ctx.headers["docleverversion"]
        }
        else {
            query.version = {
                $exists: false
            }
        }
        await interfaceSnapshot.update(query, update);
        await this.sort(id,ctx.headers["docleverversion"],objModel.interfaceModel as (typeof interfaceModel|typeof  interfaceVersion),objModel.groupModel,objModel.objGroup,obj as InstanceType<InterfaceModel>,index?index:0,false)
        let arr = await this.getChild(ctx.headers["docleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel as (typeof interfaceModel|typeof  interfaceVersion),objModel.groupModel,obj.project.toString(), null,true)
        return arr
    }



    async info (id:string,projectId:string,groupId:string,run:number,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,projectId,groupId,userId);
        let obj:InstanceType<InterfaceModel>|InstanceType<InterfaceVersionModel>|InstanceType<InterfaceSnapshotModel> = await objModel.interfaceModel.populate(objModel.objInterface, {
            path: "project",
            select: "name"
        })
        if (obj.group) {
            obj = await objModel.interfaceModel.populate(obj, {
                path: "group",
                select: "name"
            })
        }
        if (obj.owner) {
            obj = await objModel.interfaceModel.populate(obj, {
                path: "owner",
                select: "name"
            })
        }
        if (obj.editor) {
            obj = await objModel.interfaceModel.populate(obj, {
                path: "editor",
                select: "name"
            })
        }
        if (groupId && (obj.group as GroupModel)._id.toString() != groupId && groupId.length == 24) {
            obj._doc.change = 1;
        }
        if (run) {
            obj._doc.baseUrl = objModel.objProject.baseUrls;
        }
        return obj
    }



    async share (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,null,userId);
        let interfaceCurModel:any = interfaceModel;
        let inter = await interfaceCurModel.findOne({
            _id: id
        });
        if (!inter) {
            interfaceCurModel = interfaceVersion;
            inter = await interfaceCurModel.findOne({
                _id: id
            });
            if (!inter) {
                interfaceCurModel = interfaceSnapshot;
                inter = await interfaceCurModel.findOne({
                    _id: id
                });
                if (!inter) {
                    throw e.interfaceNotFound;
                }
            }
        }
        let obj:InstanceType<InterfaceModel>|InstanceType<InterfaceVersionModel>|InstanceType<InterfaceSnapshotModel> = await interfaceCurModel.populate(inter, {
            path: "project",
            select: "name"
        })
        if (obj.group) {
            obj = await interfaceCurModel.populate(obj, {
                path: "group",
                select: "name"
            })
        }
        if (obj.owner) {
            obj = await interfaceCurModel.populate(obj, {
                path: "owner",
                select: "name"
            })
        }
        if (obj.editor) {
            obj = await interfaceCurModel.populate(obj, {
                path: "editor",
                select: "name"
            })
        }
        return obj
    }



    async destroy (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,null,userId);
        await objModel.objInterface.remove()
        let query:any = {
            id: objModel.objInterface.id,
            project: objModel.objProject._id
        }
        if (ctx.headers["docleverversion"]) {
            query.version = ctx.headers["docleverversion"];
        }
        else {
            query.version = {
                $exists: false
            }
        }
        await interfaceSnapshot.remove(query)
        await example.remove({
            interface:objModel.objInterface._id
        })
        let arr = await this.getChild(ctx.headers["docleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel as (typeof interfaceModel|typeof  interfaceVersion),objModel.groupModel,objModel.objProject._id, null,true);
        return arr
    }



    async exportJSON (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,null,userId);
        let obj = {
            flag: "SBDoc",
        };
        for (let key in objModel.objInterface._doc) {
            if (objModel.objInterface._doc.hasOwnProperty(key) && key != "__v" && key != "_id" && key != "id" && key != "project" && key != "group" && key != "owner" && key != "editor") {
                obj[key] = objModel.objInterface._doc[key];
            }
        }
        let content = JSON.stringify(obj);
        let headers:any={
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename*=UTF-8\'\'' + encodeURIComponent(objModel.objInterface.name) + ".json",
            "Transfer-Encoding": "chunked",
            "Expires": 0,
            "Cache-Control": "must-revalidate, post-check=0, pre-check=0",
            "Content-Transfer-Encoding": "binary",
            "Pragma": "public",
        }
        return {headers,content}
    }



    async importJSON (groupId:string,json:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],null,null,groupId,userId);
        let obj;
        try {
            obj = JSON.parse(json);
        }
        catch (err) {
            throw e.systemReason;
        }
        if (obj.flag != "SBDoc") {
            throw e.systemReason;
        }
        let objGroup = await objModel.groupModel.findOne({
            _id: groupId
        })
        if (!objGroup) {
            throw e.groupNotFound;
        }
        obj.project = objGroup.project;
        obj.group = objGroup._id;
        obj.owner = userId;
        obj.editor = userId;
        obj.id=uuid();
        if (ctx.headers["docleverversion"]) {
            obj.version = ctx.headers["docleverversion"]
        }
        if(!obj.param)
        {
            obj.param=[];
            let o:any={
                name:"未命名",
                remark:"",
                id:uuid(),
                header:obj.header,
                queryParam:obj.queryParam,
                restParam:obj.restParam,
                outParam:obj.outParam,
                outInfo:obj.outInfo,
                before:obj.before,
                after:obj.after
            }
            if(obj.bodyParam)
            {
                o.bodyParam=obj.bodyParam;
                o.bodyInfo=obj.bodyInfo;
            }
            delete obj.header;
            delete obj.queryParam;
            delete obj.restParam;
            delete obj.outParam;
            delete obj.outInfo;
            delete obj.before;
            delete obj.after;
            delete obj.bodyParam;
            delete obj.bodyInfo;
            obj.param.push(o);
        }
        let ret = await objModel.interfaceModel.create(obj);
        return ret
    }



    async createSnapshot (id:string,dis:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,null,userId);
        delete objModel.objInterface._doc._id;
        delete objModel.objInterface._doc.createdAt;
        delete objModel.objInterface._doc.updatedAt;
        objModel.objInterface._doc.snapshot = dis;
        objModel.objInterface._doc.snapshotCreator = userId;
        if (ctx.headers["docleverversion"]) {
            objModel.objInterface._doc.version = ctx.headers["docleverversion"];
            objModel.objInterface._doc.groupType = "GroupVersion";
        }
        else {
            objModel.objInterface._doc.groupType = "Group";
        }
        let obj=await interfaceSnapshot.create(objModel.objInterface._doc);
        return obj
    }



    async snapshotList (id:string,page:number,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,null,userId);
        let query:any = {
            project: objModel.objInterface.project,
            id: objModel.objInterface.id
        }
        if (ctx.headers["docleverversion"]) {
            query.version = ctx.headers["docleverversion"]
        }
        else {
            query.version = {
                $exists: false
            }
        }
        let arr = await interfaceSnapshot.find(query, "", {
            sort: "-createdAt",
            populate: {
                path: "version"
            },
            skip: page * 10,
            limit: 10
        });
        let ret = await interfaceSnapshot.populate(arr, {
            path: "snapshotCreator",
            select: "name photo"
        })
        return ret
    }



    async removeSnapshot (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,null,userId);
        await objModel.objInterface.remove();
    }



    async snapshotRoll (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,null,userId);
        let obj = await interfaceModel.findOne({
            id: objModel.objInterface.id,
            project: objModel.objInterface.project
        });
        if (!obj) {
            throw e.interfaceNotFound;
        }
        delete objModel.objInterface._doc._id;
        delete objModel.objInterface._doc.snapshot;
        delete objModel.objInterface._doc.snapshotCreator;
        delete objModel.objInterface._doc.version;
        delete objModel.objInterface._doc.groupType;
        delete objModel.objInterface._doc.createdAt;
        delete objModel.objInterface._doc.updatedAt;
        await interfaceModel.update({
            _id: obj._id
        }, objModel.objInterface._doc);
    }


    async notify (id:string,users:string,content:string,userId:string,userInfo:UserModel,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,null,userId);
        if(!userInfo.sendInfo.user)
        {
            throw e.systemReason;
        }
        let arrTo=users.split(",");
        let arrToMail=[];
        for(let obj of arrTo)
        {
            let u=await userModel.findOne({
                _id:obj
            })
            if(u && u.email)
            {
                arrToMail.push(u.email);
            }
        }
        let title=`[DOClever]接口${objModel.objInterface.name}发生变更`;
        let objGroup=await objModel.groupModel.findOne({
            _id:objModel.objInterface.group
        });
        let g=objGroup.id;
        let arrGroup=[];
        while(g)
        {
            let obj=await objModel.groupModel.findOne({
                id:g,
                project:objModel.objInterface.project
            });
            if(obj)
            {
                arrGroup.unshift(obj.name);
            }
            g=obj.parent;
        }
        let strGroup=arrGroup.join("/");
        let contentRet=`<div>名称：${objModel.objInterface.name}</div><div>路径：${objModel.objInterface.url}</div><div>方法：${objModel.objInterface.method}</div><div>分组：${strGroup}</div><div>通知人：${userInfo.name}</div><div>通知内容：${content?content:""}</div>`;
        if(arrToMail.length>0)
        {
            util.sendMail(userInfo.sendInfo.smtp,userInfo.sendInfo.port,userInfo.sendInfo.user,userInfo.sendInfo.password,arrToMail,title,contentRet);
        }

    }


    async merge (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,null,userId);
        await objModel.interfaceModel.update({
            _id:id
        },{
            $unset:{
                delete:1
            }
        })
        let arr = await this.getChild(ctx.headers["docleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel as (typeof interfaceModel|typeof  interfaceVersion),objModel.groupModel,objModel.objProject._id.toString(), null,true);
        return arr;
    }


    async docRef (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,null,userId);
        let arr=await doc.find({
            interface:id
        },"name",{
            sort:"-createdAt"
        });
        return arr;

    }


    async getParam (id:string,param:any,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["docleversnapshot"],ctx.headers["referer"],id,null,null,userId);
        let objParam;
        for(let obj of objModel.objInterface.param)
        {
            if(obj.id==param)
            {
                objParam=obj;
                break;
            }
        }
        if(objParam)
        {
            return  objParam
        }
        else
        {
            throw e.systemReason;
        }

    }
}


export=new InterfaceDao();







