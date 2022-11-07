import db1=require("../util/db");
import {TestProjectModel} from "./types"

var dbManage=new TestProjectModel().getModelForClass(TestProjectModel,{
    schemaOptions:{
        timestamps:true,
        collection:"testprojects"
    },
    existingConnection:db1
})
export=dbManage;