
import util=require("../util/util");
import project=require("../model/projectModel")
import message=require("../model/messageModel")
import apply=require("../model/applyModel")
import team=require("../model/teamModel")
import docProject=require("../model/docProjectModel")
import testProject=require("../model/testProjectModel")
import {api, user} from "../routes/generateParams";
import messageApi = require("../../Common/routes/message")
import {keys} from "../../Common/transform";
class  Message {


    async remove (id:string){

        await message.remove({
            _id:id
        });
    }



    async list (page:number,userId:string){

        let arr=await message.find({
            user:userId
        },"-content",{
            populate:{
                path:"user",
                select:"name photo"
            },
            sort:"-createdAt",
            skip:10*page,
            limit:10
        });
        await message.update({
            user:userId
        },{
            read:1
        },{
            multi:true
        })
        return arr

    }



    async clear (userId:string){

        await message.remove({
            user:userId
        });

    }



    async newMsg (userId:string){

        let obj=await message.findOne({
            user:userId,
            read:0
        })
        return obj?true:false

    }


    async applyList (userId:string){

        let ret={
            teamPullUser:[],
            teamPullProject:[],
            userApplyTeam:[],
            projectApplyTeam:[]
        }
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
        let arrDel=[];
        arr=arr.filter(function (obj) {
            if(obj.from)
            {
                return true;
            }
            else
            {
                arrDel.push(obj);
                return false;
            }
        })
        for(let o of arrDel)
        {
            await o.remove();
        }
        ret.teamPullUser=arr;
        let arrProject:any=await project.find({
            owner:userId
        })
        arrProject=arrProject.map(function (obj) {
            return obj._id.toString()
        })
        let arrTemp:any=await docProject.find({
            owner:userId
        })
        arrTemp=arrTemp.map(function (obj) {
            return obj._id.toString()
        })
        arrProject=arrProject.concat(arrTemp);
        arrTemp=await testProject.find({
            owner:userId
        })
        arrTemp=arrTemp.map(function (obj) {
            return obj._id.toString()
        })
        arrProject=arrProject.concat(arrTemp);
        arr=await apply.find({
            to:{
                $in:arrProject
            },
            type:{
                $in:[1,4,6]
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
        arrDel=[];
        arr=arr.filter(function (obj) {
            if(obj.from && obj.to)
            {
                return true;
            }
            else
            {
                arrDel.push(obj);
                return false;
            }
        })
        for(let o of arrDel)
        {
            await o.remove();
        }
        ret.teamPullProject=arr;
        let arrTeam=await team.find({
            owner:userId
        })
        arrTeam=arrTeam.map(function (obj) {
            return obj._id.toString()
        })
        arr=await apply.find({
            to:{
                $in:arrTeam
            },
            type:{
                $in:[2,3,5,7]
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
        arrDel=[];
        arr=arr.filter(function (obj) {
            if(obj.from && obj.to)
            {
                return true;
            }
            else
            {
                arrDel.push(obj);
                return false;
            }
        })
        for(let o of arrDel)
        {
            await o.remove();
        }
        arr.forEach(function (obj) {
            if(obj.type==2)
            {
                ret.userApplyTeam.push(obj);
            }
            else if(obj.type==3 || obj.type==5 || obj.type==7)
            {
                ret.projectApplyTeam.push(obj);
            }
        })
        return ret

    }
}


export=new Message;







