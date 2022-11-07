import {arrayProp, prop, Ref, Typegoose} from "typegoose";
import { DocProjectModel} from "./types";
import { DocModel} from "./docTypes"
class BaseModel extends Typegoose {
    @prop()
    createdAt:Date
    @prop()
    updatedAt:Date
    //@prop()
    _doc:any
    _id:any
}
export class DocGroupModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:DocGroupModel})
    parent:Ref<DocGroupModel>
    @prop({ref:DocProjectModel})
    project:Ref<DocProjectModel>
    @arrayProp({itemsRef:DocGroupModel,default:[]})
    childGroup:Ref<DocGroupModel>[]
    @arrayProp({default:[],itemsRef:DocModel})
    childDoc:Ref<DocModel>[]
}