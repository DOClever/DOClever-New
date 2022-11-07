import db1=require("../util/db");
import {InterfaceVersionModel} from "./types"

var dbManage=new InterfaceVersionModel().getModelForClass(InterfaceVersionModel,{
    schemaOptions:{
        timestamps:true,
        collection:"interfaceversions",
        strict:false
    },
    existingConnection:db1
})
export=dbManage;