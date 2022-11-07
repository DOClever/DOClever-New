/**
 * Created by sunxin on 2017/7/5.
 */


import e=require("../util/error.json");
import util=require("../util/util");
import poll=require("../model/pollModel")
import testCollection=require("../model/testCollectionModel")
import {api, user} from "../routes/generateParams";
import pollApi = require("../../Common/routes/poll")
import {keys} from "../../Common/transform";
import {InstanceType} from "typegoose";
import {PollModel} from "../model/types";
class  Poll {


    async save (id:string,project:string,collection:string,users:string,date:string,time:string,user:string,password:string,smtp:string,port:number,url:string,failSend:number,phoneInfo:string,owner:string,interProject:string,immediate:number){

        let objCollection=await testCollection.findOne({
            _id:collection
        });
        if(!objCollection)
        {
            throw e.testCollectionNotFound;
        }
        else if(objCollection.poll && id  && objCollection.poll.toString()!=id)
        {
            throw e.systemReason;
        }
        let obj:InstanceType<PollModel>;
        let update:any={
            project:project,
            users:JSON.parse(users),
            date:JSON.parse(date),
            time:JSON.parse(time),
            sendInfo:{
                user:user,
                password:password,
                smtp:smtp,
                port:port
            },
            baseUrl:url,
            phoneInfo:JSON.parse(phoneInfo),
            failSend:failSend,
            owner:owner,
        }
        if(interProject)
        {
            update.interProject=interProject;
        }
        if(id)
        {
            obj=await poll.findOneAndUpdate({
                _id:id
            },update,{
                new:true
            });
        }
        else
        {
            obj=await poll.create(update);
        }
        objCollection.poll=obj._id;
        await objCollection.save();
        if(immediate)
        {
            util.runPoll([obj]);
        }
        return obj

    }



    async remove (id:string){

        let query={
            _id:id
        }
        await poll.remove(query)
        await testCollection.update({
            poll:id
        },{
            $unset:{
                poll:1
            }
        })

    }



    async info (id:string){

        let query={
            _id:id
        }
        let obj=await poll.findOne(query,null,{
            populate:{
                path:"users",
                select:"name photo"
            }
        })
        if(!obj)
        {
            throw e.pollNotFound;
        }
        return obj

    }
}

export=new Poll;
