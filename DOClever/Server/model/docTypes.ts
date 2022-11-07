import {arrayProp, prop, Ref, Typegoose} from "typegoose";
import * as mongoose from "mongoose";
import {DocProjectModel, UserModel} from "./types";
import {DocGroupModel} from "./docGroupTypes"
class BaseModel extends Typegoose {
    @prop()
    createdAt:Date
    @prop()
    updatedAt:Date
    //@prop()
    _doc:any
    _id:any
}
export class DocModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:DocGroupModel})
    group:Ref<DocGroupModel>
    @prop({ref:DocProjectModel})
    project:Ref<DocProjectModel>
    @prop({ref:UserModel})
    owner:Ref<UserModel>
    @prop({ref:UserModel})
    editor:Ref<UserModel>
    @prop({default:""})
    content:string
    @arrayProp({default:[],items:Object})
    img:any[]
    @arrayProp({default:[],items:Object})
    file:any[]
    @arrayProp({items:mongoose.Types.ObjectId,default:[]})
    interface:mongoose.Types.ObjectId[]
}