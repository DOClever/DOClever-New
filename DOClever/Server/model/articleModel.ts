import db1=require("../util/db");
import {ArticleModel} from "./types"

var dbManage=new ArticleModel().getModelForClass(ArticleModel,{
    schemaOptions:{
        timestamps:true,
        collection:"articles"
    },
    existingConnection:db1
})
export=dbManage;