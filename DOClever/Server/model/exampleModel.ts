import db1=require("../util/db");
import {ExampleModel} from "./types"

var dbManage=new ExampleModel().getModelForClass(ExampleModel,{
    schemaOptions:{
        timestamps:true,
        collection:"examples",
        strict:false
    },
    existingConnection:db1
})
export=dbManage;