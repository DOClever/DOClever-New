import db1=require("../util/db");
import {GroupModel} from "./types"

var dbManage=new GroupModel().getModelForClass(GroupModel,{
    schemaOptions:{
        timestamps:true,
        collection:"groups"
    },
    existingConnection:db1
})
export=dbManage;