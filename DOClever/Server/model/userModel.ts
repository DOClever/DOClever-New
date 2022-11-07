import db1=require("../util/db");
import {UserModel} from "./types"

var dbManage=new UserModel().getModelForClass(UserModel,{
    schemaOptions:{
        timestamps:true,
        collection:"users"
    },
    existingConnection:db1
})
export=dbManage;