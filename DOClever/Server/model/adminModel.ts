import db1=require("../util/db");
import {AdminModel} from "./types"

var dbManage=new AdminModel().getModelForClass(AdminModel,{
    schemaOptions:{
        timestamps:true,
        collection:"admins"
    },
    existingConnection:db1
})
export=dbManage;