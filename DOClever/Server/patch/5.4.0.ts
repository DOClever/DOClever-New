

import project=require("../model/projectModel");
import test=require("../model/testModel");
import testGroup=require("../model/testGroupModel");
import testModule=require("../model/testModuleModel");
import testProject=require("../model/testProjectModel");
import poll=require("../model/pollModel");
import testCollection=require("../model/testCollectionModel");
import uuid=require("uuid");
import mongoose = require('mongoose');
import db=require("../util/db");
import {ProjectUsersModel} from "../model/types";
export=async function () {
    let modalA=db.model("TestModuleVersion",new mongoose.Schema({}));
    let modalB=db.model("TestGroupVersion",new mongoose.Schema({}));
    let modalC=db.model("TestVersion",new mongoose.Schema({}));
    for ( let model of [modalA,modalB,modalC] ) {
        let list = await model.db.db.listCollections({
            name: model.collection.name
        }).toArray();
        if ( list.length !== 0 ) {
            await model.collection.drop();
        }
    }
    let arr:any=await testModule.find({},"project");
    arr=arr.map(function (obj) {
        return obj.project.toString();
    })
    arr=arr.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    })
    for(let o of arr)
    {
        let objProject=await project.findOne({
            _id:o
        })
        if(!objProject)
        {
            continue;
        }
        let query:any={
            name:objProject.name,
            owner:objProject.owner,
            users:objProject.users.map(function (obj:ProjectUsersModel) {
                return obj.user;
            })
        }
        if(objProject.dis)
        {
            query.dis=objProject.dis;
        }
        if(objProject.team)
        {
            query.team=objProject.team
        }
        let objTestProject=await testProject.create(query);
        let objPoll=await poll.findOneAndUpdate({
            project:objProject._id
        },{
            project:objTestProject._id,
            owner:objTestProject.owner
        },{
            new:true
        })
        let arrTestModule=await testModule.find({
            project:o
        });
        for(let objModule of arrTestModule)
        {
            let arrTestGroup=await testGroup.find({
                module:objModule._id
            });
            // @ts-ignore
            objModule.data=arrTestGroup;
            // @ts-ignore
            for(let objGroup of objModule.data)
            {
                let arrTest=await test.find({
                    group:objGroup._id
                })
                objGroup.data=arrTest;
            }
        }
        let arrUser=[objProject.owner].concat(query.users);
        for(let u of arrUser)
        {
            let objId={};
            for(let objModule of arrTestModule)
            {
                let objNewModule=await testModule.create({
                    name:objModule.name,
                    project:objTestProject._id,
                    id:objModule.id?objModule.id:uuid(),
                    user:u
                })
                // @ts-ignore
                for(let objGroup of objModule.data)
                {
                    let objNewGroup=await testGroup.create({
                        name:objGroup.name,
                        module:objNewModule._id,
                        project:objTestProject._id,
                        id:objGroup.id?objGroup.id:uuid(),
                        user:u
                    })
                    for(let objTest of objGroup.data)
                    {
                        let objNewTest=await test.create({
                            name:objTest.name,
                            project:objTestProject._id,
                            module:objNewModule._id,
                            group:objNewGroup._id,
                            remark:objTest.remark,
                            owner:u,
                            editor:u,
                            status:objTest.status,
                            code:objTest.code,
                            output:objTest.output,
                            id:objTest.id?objTest.id:uuid(),
                            user:u
                        })
                        objId[objTest._id]=objNewTest._id
                    }
                }
            }
            if(objPoll)
            {
                let i=0;
                let arr=[];
                objPoll.test.forEach(function (obj) {
                    // @ts-ignore
                    if(objId[obj])
                    {
                        // @ts-ignore
                        arr.push({
                            test:objId[obj.toString()],
                            output:"",
                            argv:[],
                            status:0,
                            id:i++,
                            time:0,
                            mode:"code"
                        })
                    }
                })
                let query={
                    name:"未命名",
                    project:objTestProject._id,
                    tests:arr,
                    user:u,
                    poll: undefined
                }
                if(u.toString()==objProject.owner.toString())
                {
                    query.poll=objPoll._id;
                }
                await testCollection.create(query);
            }
        }
        for(let objModule of arrTestModule)
        {
            // @ts-ignore
            for(let objGroup of objModule.data)
            {
                for(let objTest of objGroup.data)
                {
                    await objTest.remove();
                }
                await objGroup.remove();
            }
            await objModule.remove();
        }
    }
}









