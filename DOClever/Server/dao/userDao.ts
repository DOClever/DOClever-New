/**
 * Created by sunxin on 2016/11/9.
 */


import e=require("../util/error.json");
import util=require("../util/util");
import userModel=require("../model/userModel")
import apply=require("../model/applyModel")
import project=require("../model/projectModel")
import team=require("../model/teamModel")
import teamGroup=require("../model/teamGroupModel")
import message=require("../model/messageModel")
import info=require("../model/infoModel")
import userApi = require("../../Common/routes/user")
import {keys} from "../../Common/transform";
import user=require("../model/userModel")
import request=require("request");
import fs=require("fs")
import fse=require("fs-extra")
import path=require("path")
import con=require("../../config.json");
import uuid=require("uuid")
import {InstanceType} from "typegoose";
import {UserModel} from "../model/types";
class UserDao {
    async downloadImg (url:string){
        return new Promise<string>(function (resolve) {
            var imgPath=path.join(con.filePath,"img",uuid()+".png");
            var pipe=request(url).pipe(fs.createWriteStream(imgPath))
            pipe.on("finish",function () {
                var filePath=imgPath;
                var i=filePath.lastIndexOf(path.sep);
                i=filePath.lastIndexOf(path.sep,i-1);
                filePath=filePath.substring(i).replace(/\\/g,"/");
                resolve(filePath);
            })
        })
    }
    async setQQImg (userId:string,url:string){
        let imgPath=await this.downloadImg(url);
        let obj=await user.findOneAndUpdate({
            _id:userId
        },{
            photo:imgPath
        });
        if(obj.photo)
        {
            util.delImg(obj.photo);
        }
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
    async updateUser (name:string,password:string,id?:string,qqId?:string){
        let obj:InstanceType<UserModel>;
        if(id)
        {
            obj= await user.findOne({
                _id:id
            },"-password -question -answer");
        }
        else if(qqId)
        {
            obj= await user.findOne({
                qqId:qqId
            },"-password -question -answer");
        }
        else
        {
            obj= await user.findOne({
                name:name,
                password:password
            },"-password -question -answer");
        }
        if(obj)
        {
            obj.lastLoginDate=Date.now() as any;
            obj.loginCount++;
            await obj.save();
        }
        return obj;
    }
    async getVersionInfo (){
        let obj=await info.findOne();
        let ret=<{
            version:string,
            url:string
        }>{
            version:obj.version
        }
        if(await fse.pathExists(path.join(__dirname,"../../resource/client.zip")))
        {
            ret.url="/resource/client.zip";
        }
        return ret;
    }

    async login (id:string,qqid:string,qqimg:string,name:string,password:string,session:any){

        let obj:InstanceType<UserModel>;
        if(id)
        {
            obj= await this.updateUser(null,null,id);
        }
        else if(qqid)
        {
            obj= await this.updateUser(null,null,null,qqid);
            if(obj)
            {
                await this.setQQImg(obj._id,qqimg)
            }
        }
        else
        {
            obj= await this.updateUser(name,password);
        }
        if(obj)
        {
            if(obj.state==1)
            {
                session.userid=obj._id;
                return obj
            }
            else
            {
                throw e.userForbidden;
            }
        }
        else
        {
            throw e.userOrPwdWrong;
        }

    }

    async createQQ (name:string,password:string,qqid:string,question:string,answer:string,email:string,qqimg:string){

        let obj:any={
            name:name,
            password:password,
            qqId:qqid,
            question:question,
            answer:answer,
            email:email
        };
        obj.photo=await this.downloadImg(qqimg);
        let ret=await userModel.findOne({
            name:obj.name
        });
        if(ret)
        {
            throw e.duplicateUser;
        }
        let objUser=await userModel.create(obj);
        delete objUser._doc.password;
        return objUser

    }

    async save (userid:string,p:any,photo:string){

        if(userid)
        {
            let update:any={};
            for(let key in p)
            {
                if(key!="userid")
                {
                    update[key]=p[key];
                }
            }
            if(update.name)
            {
                let ret=await userModel.findOne({
                    name:update.name
                });
                if(ret)
                {
                    throw e.duplicateUser;
                }
            }
            let obj=await userModel.findOneAndUpdate({
                _id:userid
            },update,{
                new:false
            });
            if(!obj)
            {
                throw e.userNotFound;
            }
            else if(photo && obj.photo && photo!=obj.photo)
            {
                util.delImg(obj.photo);
            }
            obj=await userModel.findOne({
                _id:userid
            },"-password")
            return obj
        }
        else
        {
            let objInfo=await info.findOne();
            if(!objInfo.register)
            {
                throw e.registerForbidden;
            }
            let obj:any={};
            for(let key in p)
            {
                obj[key]=p[key];
            }
            if(!obj.name || !obj.password)
            {
                throw e.paramWrong;
            }
            else if(!obj.email)
            {
                throw e.paramWrong;
            }
            let ret=await userModel.findOne({
                name:obj.name
            });
            if(ret)
            {
                throw e.duplicateUser;
            }
            let objUser=await userModel.create(obj);
            delete objUser._doc.password;
            return objUser
        }
    }


    async logout (session:any){

        session.userid=null;
        delete session.userid;

    }



    async editPass (userPassword:string,oldpass:string,newpass:string,user:InstanceType<UserModel>){

        if(userPassword!=oldpass)
        {
            throw e.userOrPwdWrong;
        }
        userPassword=newpass;
        await user.save();

    }


    async reset (name:string,answer:string,password:string){

        let obj=await userModel.findOne({
            name:name
        });
        if(!obj)
        {
            throw e.userNotFound;
        }
        if(obj.answer!=answer)
        {
            throw e.userOrPwdWrong;
        }
        obj.password=password;
        await obj.save();

    }


    async question (name:string){

        let obj=await userModel.findOne({
            name:name
        });
        if(!obj)
        {
            throw e.userNotFound;
        }
        if(obj.question=="")
        {
            throw e.questionIsEmpty;
        }
        return obj.question

    }



    async applyList (userId:string){

        let arr=await apply.find({
            to:userId,
            type:0,
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



    async handleApply (applyId:string,state:number,userId:string){

        let obj:any=await apply.findOne({
            _id:applyId
        },null,{
            populate:{
                path:"from",
                select:"name"
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
        let objTeam=await team.findOne({
            _id:(<any>obj.from)._id
        })
        if(!objTeam)
        {
            throw e.teamNotFound;
        }
        obj.editor=userId;
        if(await this.existUserInTeam((<any>obj.from)._id,userId))
        {
            obj.state=3;
            await obj.save();
            throw e.userAlreadyInTeam;
        }
        obj.state=state;
        if(state==1)
        {
            let objGroup=await teamGroup.findOneAndUpdate({
                _id:obj.relatedData
            },{
                $addToSet:{
                    users:{
                        user:userId,
                        role:1
                    }
                }
            })
            if(!objGroup)
            {
                obj.state=3;
                await obj.save();
                throw e.teamGroupNotFound;
            }
        }
        await message.create({
            name:state==1?"您已同意加入团队":"您已拒绝加入团队",
            dis:`您已${state==1?"同意":"拒绝"}加入团队${obj.from.name}`,
            user:userId,
            type:1
        })
        await obj.save();
        if(state==1)
        {
            let obj=await team.findOne({
                _id:objTeam._id
            })
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
            return obj
        }
        else
        {
            return
        }

    }


    async setSendInfo (user:string,password:string,smtp:string,objUser:InstanceType<UserModel>){

        objUser.sendInfo.user=user;
        objUser.sendInfo.password=password;
        objUser.sendInfo.smtp=smtp;
        await objUser.save();

    }


    async getSendInfo (user:InstanceType<UserModel>){

        return user.sendInfo?user.sendInfo:{}

    }

    async version (){

        let obj=await this.getVersionInfo();
        return obj

    }
}

export=new UserDao();










