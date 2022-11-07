

import interfaceModel=require("../model/interfaceModel");
require("../model/groupModel")
require("../model/groupVersionModel")
import interfaceVersion=require("../model/interfaceVersionModel");
import interfaceSnapshot=require("../model/interfaceSnapshotModel");
export=async function () {
    var arr=[interfaceModel,interfaceVersion,interfaceSnapshot];
    var i=0;
    for(let inter of arr)
    {
        let arrInter=await (<any>inter).find({},"",{
            populate:{
                path:"group",
                select:"project"
            }
        })
        for(let obj of arrInter)
        {
            if(obj.group && obj.group.project && obj.group.project.toString()!=obj.project.toString())
            {
                i++;
                obj.project=obj.group.project;
                await obj.saveAsync();
            }
        }
    }
    if(i>0)
    {
        console.log(`修复了${i}条数据`)
    }
}









