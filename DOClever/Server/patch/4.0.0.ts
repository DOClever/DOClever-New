import project=require("../model/projectModel")
import group=require("../model/groupModel");
import interfaceModel=require("../model/interfaceModel");
import interfaceVersion=require("../model/interfaceVersionModel");
import interfaceSnapshot=require("../model/interfaceSnapshotModel");
import uuid=require("uuid");
export=async function () {
    var arrProject=await project.$where(function () {
        return (this.baseUrls.length>0 && typeof(this.baseUrls[0])=="string")
    })
    for(let obj of (<any>arrProject))
    {
        obj.baseUrls=obj.baseUrls.map(function (obj) {
            return {
                url:obj,
                remark:""
            }
        })
        await project.update({
            _id:obj._id
        },{
            baseUrls:obj.baseUrls
        });
    }
    var arrGroup=await group.find({
        id:{
            $exists:false
        }
    })
    for(let obj of arrGroup)
    {
        obj.id=uuid();
        await obj.save()
    }

    var arrInterface=await interfaceModel.find({
        id:{
            $exists:false
        }
    })
    for(let obj of arrInterface)
    {
        obj.id=uuid();
        await obj.save()
    }

    let arr=[interfaceModel,interfaceVersion,interfaceSnapshot];
    for(let model of arr)
    {
        let arrInterface=await model.find({
            $or:[
                {
                    param:{
                        $exists:false
                    }
                },
                {
                    param:{
                        $size:0
                    }
                }
            ]
        })
        for(let obj of arrInterface)
        {
            let query:any={
                name:"默认",
                id:uuid(),
                remark:""
            };
            if(obj._doc.header)
            {
                query.header=obj._doc.header;
            }
            else
            {
                query.header=[];
            }
            if(obj._doc.queryParam)
            {
                query.queryParam=obj._doc.queryParam;
            }
            else
            {
                query.queryParam=[];
            }
            if(obj._doc.bodyParam)
            {
                query.bodyParam=obj._doc.bodyParam;
            }
            else
            {
                if(obj._doc.method=="POST" || obj._doc.method=="PUT" || obj._doc.method=="PATCH")
                {
                    query.bodyParam=[];
                }
            }
            if(obj._doc.restParam)
            {
                query.restParam=obj._doc.restParam;
            }
            else
            {
                query.restParam=[];
            }
            if(obj._doc.bodyInfo)
            {
                query.bodyInfo=obj._doc.bodyInfo;
            }
            else
            {
                if(obj._doc.method=="POST" || obj._doc.method=="PUT" || obj._doc.method=="PATCH")
                {
                    query.bodyInfo={
                        "rawText" : "",
                        "rawFileRemark" : "",
                        "rawTextRemark" : "",
                        "rawType" : 0,
                        "type" : 0
                    };
                }
            }
            if(obj._doc.outParam)
            {
                query.outParam=obj._doc.outParam;
            }
            else
            {
                query.outParam=[];
            }
            if(obj._doc.outInfo)
            {
                query.outInfo=obj._doc.outInfo;
            }
            else
            {
                query.outInfo={
                    "jsonType" : 0,
                    "rawMock" : "",
                    "rawRemark" : "",
                    "type" : 0
                }
            }
            if(obj._doc.before)
            {
                query.before=obj._doc.before;
            }
            if(obj._doc.after)
            {
                query.after=obj._doc.after;
            }
            await model.findOneAndUpdate({
                _id:obj._id
            },{
                param:[query],
                $unset:{
                    header:1,
                    queryParam:1,
                    bodyParam:1,
                    restParam:1,
                    bodyInfo:1,
                    outParam:1,
                    outInfo:1,
                    before:1,
                    after:1
                }
            })
        }
    }

}









