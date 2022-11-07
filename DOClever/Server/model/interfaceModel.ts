import db1=require("../util/db");
import {InterfaceModel} from "./types"

var dbManage=new InterfaceModel().getModelForClass(InterfaceModel,{
    schemaOptions:{
        timestamps:true,
        collection:"interfaces",
        strict:false
    },
    existingConnection:db1
})
export=dbManage;