import db1=require("../util/db");
import {TestModel} from "./types"

var dbManage=new TestModel().getModelForClass(TestModel,{
    schemaOptions:{
        timestamps:true,
        collection:"tests",
        minimize:false
    },
    existingConnection:db1
})
export=dbManage;