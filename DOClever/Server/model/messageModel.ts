import db1=require("../util/db");
import {MessageModel} from "./types"

var dbManage=new MessageModel().getModelForClass(MessageModel,{
    schemaOptions:{
        timestamps:true,
        collection:"messages"
    },
    existingConnection:db1
})
export=dbManage;