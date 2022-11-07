import db1=require("../util/db");
import {ApplyModel} from "./types"

var dbManage=new ApplyModel().getModelForClass(ApplyModel,{
    schemaOptions:{
        timestamps:true,
        collection:"applies"
    },
    existingConnection:db1
})
export=dbManage;