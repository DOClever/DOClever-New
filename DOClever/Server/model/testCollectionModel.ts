import db1=require("../util/db");
import {TestCollectionModel} from "./types"

var dbManage=new TestCollectionModel().getModelForClass(TestCollectionModel,{
    schemaOptions:{
        timestamps:true,
        collection:"testcollections"
    },
    existingConnection:db1
})
export=dbManage;