import db1=require("../util/db");
import {TempModel} from "./types"

var dbManage=new TempModel().getModelForClass(TempModel,{
    schemaOptions:{
        timestamps:true,
        collection:"temps"
    },
    existingConnection:db1
})
export=dbManage;