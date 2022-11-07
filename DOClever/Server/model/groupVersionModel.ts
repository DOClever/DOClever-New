import db1=require("../util/db");
import {GroupVersionModel} from "./types"

var dbManage=new GroupVersionModel().getModelForClass(GroupVersionModel,{
    schemaOptions:{
        timestamps:true,
        collection:"groupversions"
    },
    existingConnection:db1
})
export=dbManage;