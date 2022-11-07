import {prop, Typegoose, ModelType, InstanceType, Ref, arrayProp, pre,index} from 'typegoose';
import {DocGroupModel} from "./docGroupTypes";
import {Schema} from "mongoose"
class BaseModel extends Typegoose {
    @prop()
    createdAt:Date
    @prop()
    updatedAt:Date
    //@prop()
    _doc:any
    _id:Schema.Types.ObjectId
}

class UserSendInfoModel {
    @prop({default:""})
    user:string
    @prop({default:""})
    password:string
    @prop({default:""})
    smtp:string
    @prop({default:465})
    port:number
}

export class UserModel extends BaseModel {
    @prop()
    name:string
    @prop()
    password:string
    @prop()
    sex:string
    @prop()
    age:number
    @prop()
    company:string
    @prop()
    photo:string
    @prop()
    phone:string
    @prop({default:1})
    state:number
    @prop()
    qq:string
    @prop()
    email:string
    @prop({default:0})
    loginCount:number
    @prop()
    lastLoginDate:Date
    @prop()
    question:string
    @prop()
    answer:string
    @prop()
    qqId:string
    @prop()
    sendInfo:UserSendInfoModel
}


class TeamNoticeModel {
    @prop()
    content:string
    @prop()
    date:string
}

@index({owner:1})
export class TeamModel extends BaseModel {
    @prop()
    name:string
    @prop()
    dis:string
    @prop({ref:UserModel})
    owner:Ref<UserModel>
    @arrayProp({default:[],items:TeamNoticeModel})
    notice:TeamNoticeModel[]
}

export class ProjectUsersModel{
    @prop({ref:UserModel})
    user:Ref<UserModel>
    @prop()
    role:number   // 0 管理员  1 观察者
    @prop()
    option:object
}

class ProjectBaseUrlsEnvModel {
    @prop()
    key:string
    @prop()
    value:string
    @prop()
    remark?:string
}

export class ProjectBaseUrlsModel {
    @prop()
    remark?:string
    @prop()
    url:string
    @arrayProp({items:ProjectBaseUrlsEnvModel,default:[]})
    env?:ProjectBaseUrlsEnvModel[]
}

@index({project:1,owner:1})
export class ProjectModel extends BaseModel {
    @prop()
    name:string
    @prop({default:""})
    dis:string
    @arrayProp({default:[],items:ProjectBaseUrlsModel})
    baseUrls: ProjectBaseUrlsModel[]
    @prop({ref:UserModel})
    owner:Ref<UserModel>
    @arrayProp({_id:false,default:[],items:ProjectUsersModel})
    users:Ref<ProjectUsersModel>[]
    @prop({default:""})
    before:string
    @prop({default:""})
    after:string
    @prop({ref:TeamModel})
    team:Ref<TeamModel>
    @prop()
    source:{type:number,url?:string}  // 0,swagger,1,rap,2,postman
    @prop({default:0})
    public:number
}
@index({project:1})
export class VersionModel extends BaseModel {
    @prop()
    version:string
    @prop({default:""})
    dis:string
    @prop({ref:ProjectModel})
    project:Ref<ProjectModel>
    @prop({ref:UserModel})
    creator:Ref<UserModel>
    @arrayProp({default:[],items:Object})
    baseUrls:ProjectBaseUrlsModel[]
    @prop({default:""})
    before:string
    @prop({default:""})
    after:string
    @prop()
    source:object
}



class TestProjectCooperationModel {
    @prop({ref:UserModel})
    user:Ref<UserModel>
    @arrayProp({default:[],itemsRef:UserModel})
    users:Ref<UserModel>[]
}

export class TestProjectModel extends BaseModel {
    @prop()
    name:string
    @prop({default:""})
    dis:string
    @arrayProp({itemsRef:UserModel,default:[]})
    users:Ref<UserModel>[]
    @prop({ref:UserModel})
    owner:Ref<UserModel>
    @prop({ref:TeamModel})
    team:Ref<TeamModel>
    @arrayProp({default:[],_id:false,items:TestProjectCooperationModel})
    cooperation:TestProjectCooperationModel[]
}

export class AdminModel extends BaseModel {
    @prop()
    name:string
    @prop()
    password:string
    @prop()
    lastLoginDate:Date
    @prop({default:0})
    loginCount:number
}

export class ApplyModel extends BaseModel{
    @prop({default:""})
    dis:string
    @prop()
    fromType:string    //User,Project,Team,DocProject,TestProject
    @prop({refPath:"fromType"})
    from:Ref<UserModel | ProjectModel | TeamModel | DocProjectModel | TestProjectModel>
    @prop()
    toType:string      //Team,User,Project,DocProject,TestProject
    @prop({refPath:"toType"})
    to:Ref<UserModel | ProjectModel | TeamModel | DocProjectModel | TestProjectModel>
    @prop()
    type:number       //0 拉人  1 拉项目  2 人员申请加入  3  项目申请加入 4 拉文档  5 文档申请加入 6 拉测试  7 测试申请加入
    @prop()
    state:number     //0 申请中  1 同意  2 拒绝  3 忽略
    @prop({ref:UserModel})
    creator:Ref<UserModel>
    @prop({ref:UserModel})
    editor:Ref<UserModel>
    @prop()
    relatedData:any
}

export class ArticleModel extends BaseModel {
    @prop()
    title:string
    @prop({default:""})
    content:string
    @prop({ref:ProjectModel})
    project:Ref<ProjectModel>
    @prop({ref:UserModel})
    creator:Ref<ProjectModel>
}

export class DocProjectModel extends BaseModel{
    @prop()
    name:string
    @prop()
    dis:string
    @arrayProp({itemsRef:UserModel,default:[]})
    users:Ref<UserModel>[]
    @prop({ref:UserModel})
    owner:Ref<UserModel>
    @prop()
    totalSize:number
    @prop({default:0})
    useSize:number
    @arrayProp({default:[],itemsRef:DocGroupModel})
    childGroup:Ref<DocGroupModel>[]
    @prop({ref:TeamModel})
    team:Ref<TeamModel>
    @prop({default:0})
    publicTeam:number
    @prop({default:0})
    public:number
}






export class ExampleModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:ProjectModel})
    project:Ref<ProjectModel>
    @prop({default:"Interface"})
    interfaceType:string
    @prop({refPath:"interfaceType"})
    interface:Ref<InterfaceModel>
    @prop({ref:UserModel})
    owner:Ref<UserModel>
    @prop()
    paramId:string
    @prop()
    param:object
}
@index({project:1,id:1,parent:1})
export class GroupModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:ProjectModel})
    project:Ref<ProjectModel>
    @prop({default:0})
    type:number      //0 普通 1 回收站
    @prop()
    id:string
    @prop()
    parent:string
    @prop()
    delete:number
    @prop({default:0})
    sort:number
}

export class GroupVersionModel extends BaseModel{
    @prop()
    name:string
    @prop({ref:ProjectModel})
    project:Ref<ProjectModel>
    @prop({default:0})
    type:number //0 普通 1 回收站
    @prop()
    id:string
    @prop({ref:VersionModel})
    version:Ref<VersionModel>
    @prop()
    parent:string
    @prop()
    delete:number
    @prop({default:0})
    sort:number
}

class InfoDBModel {
    @prop({default:""})
    dbPath:string
    @prop({default:""})
    backPath:string
    @arrayProp({default:[],items:Object})
    hours:any[]
    @prop({default:""})
    host:string
    @prop({default:""})
    name:string
    @prop({default:""})
    user?:string
    @prop({default:""})
    pass?:string
    @prop({default:""})
    authDb?:string
}

export class InfoModel extends BaseModel{
    @prop()
    version:string
    @prop({default:1})
    register:number
    @prop()
    dbName:InfoDBModel
}
@index({project:1,group:1,id:1})
export class InterfaceModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:ProjectModel})
    project:Ref<ProjectModel>
    @prop({ref:GroupModel})
    group:Ref<GroupModel>
    @prop()
    url:string
    @prop()
    remark:string
    @prop()
    method:string
    @arrayProp({items:Object})
    param:any[]
    @prop({ref:UserModel})
    owner:Ref<UserModel>
    @prop({ref:UserModel})
    editor:Ref<UserModel>
    @prop()
    mock:string
    @prop({default:0})
    finish:number
    @prop()
    before:object
    @prop()
    after:object
    @prop()
    id:string
    @prop()
    delete:number
    @prop({default:0})
    sort:number
}

export class InterfaceSnapshotModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:ProjectModel})
    project:Ref<ProjectModel>
    @prop()
    groupType:string
    @prop({ref:GroupModel})
    group:Ref<GroupModel>
    @prop()
    url:string
    @prop()
    remark:string
    @prop()
    method:string
    @arrayProp({items:Object})
    param:any[]
    @prop({ref:UserModel})
    owner:Ref<UserModel>
    @prop({ref:UserModel})
    editor:Ref<UserModel>
    @prop()
    mock:string
    @prop({default:0})
    finish:number
    @prop()
    before:object
    @prop()
    after:object
    @prop()
    id:string
    @prop({default:""})
    snapshot:string
    @prop({ref:UserModel})
    snapshotCreator:Ref<UserModel>
    @prop({ref:VersionModel})
    version:Ref<VersionModel>
}

export class InterfaceVersionModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:ProjectModel})
    project:Ref<ProjectModel>
    @prop()
    group:Ref<GroupModel>
    @prop()
    url:string
    @prop()
    remark:string
    @prop()
    method:string
    @arrayProp({items:Object})
    param:any[]
    @prop({ref:UserModel})
    owner:Ref<UserModel>
    @prop({ref:UserModel})
    editor:Ref<UserModel>
    @prop()
    mock:string
    @prop({default:0})
    finish:number
    @prop()
    before:object
    @prop()
    after:object
    @prop()
    id:string
    @prop({ref:VersionModel})
    version:Ref<VersionModel>
    @prop()
    delete:number
    @prop({default:0})
    sort:number
}

export class MessageModel extends BaseModel {
    @prop({default:""})
    name:string
    @prop({default:""})
    dis:string
    @prop({ref:UserModel})
    user:Ref<UserModel>
    @prop()
    type:number  //0 个人申请消息  1  项目申请消息
    @prop({default:0})
    read:number
}


export class RunModel extends BaseModel {
    @prop({ref:UserModel})
    user:Ref<UserModel>
    @prop()
    host:string
    @prop()
    path:string
}

export class StatisticModel extends BaseModel {
    @prop()
    date:string
    @prop({default:0})
    interface:number
    @prop({default:0})
    project:number
    @prop({default:0})
    team:number
    @prop({default:0})
    user:number
    @prop({default:0})
    userRegister:number
    @prop({default:0})
    userLogin:number
}

export class StatusModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:ProjectModel})
    project:Ref<ProjectModel>
    @arrayProp({default:[],items:Object})
    data:any[]
    @prop()
    id:string
}

export class StatusVersionModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:ProjectModel})
    project:Ref<ProjectModel>
    @arrayProp({default:[],items:Object})
    data:any[]
    @prop()
    id:string
    @prop({ref:VersionModel})
    version:Ref<VersionModel>
}

export class TeamGroupUsersModel {
    @prop({ref:UserModel})
    user:Ref<UserModel>
    @prop()
    role:number   // 0 管理员  1 普通成员 2 拥有者
}

export class TeamGroupModel extends BaseModel {
    @prop()
    name:string
    @arrayProp({_id:false,default:[],items:TeamGroupUsersModel})
    users:TeamGroupUsersModel[]
    @prop({ref:TeamModel})
    team:Ref<TeamModel>
}



export class TemplateModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:ProjectModel})
    project:Ref<ProjectModel>
    @prop()
    url:string
    @prop()
    remark:string
    @prop()
    method:string
    @arrayProp({items:Object})
    param:any[]
    @prop({ref:VersionModel})
    version:Ref<VersionModel>
}

export class TempModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:UserModel})
    user:Ref<UserModel>
    @prop({ref:ProjectModel})
    project:Ref<ProjectModel>
}

export class TestModuleModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:TestProjectModel})
    project:Ref<TestProjectModel>
    @prop()
    id:string
    @prop({ref:UserModel})
    user:Ref<UserModel>
}

export class TestGroupModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:TestModuleModel})
    module:Ref<TestModuleModel>
    @prop({ref:TestProjectModel})
    project:Ref<TestProjectModel>
    @prop()
    id:string
    @prop({ref:UserModel})
    user:Ref<UserModel>
}

export class TestModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:TestProjectModel})
    project:Ref<TestProjectModel>
    @prop({ref:TestModuleModel})
    module:Ref<TestModuleModel>
    @prop({ref:TestGroupModel})
    group:Ref<TestGroupModel>
    @prop()
    remark:string
    @prop({ref:UserModel})
    owner:Ref<UserModel>
    @prop({ref:UserModel})
    editor:Ref<UserModel>
    @prop({default:0})
    status:number     //0 无状态  1 已通过  2 未通过
    @prop({default:""})
    code:string
    @arrayProp({items:Object,default:[]})
    ui:any[]
    @prop({default:""})
    output:string
    @prop()
    id:string
    @prop({ref:UserModel})
    user:Ref<UserModel>
}


class TestCollectionTestsModel {
    @prop({ref:TestModel})
    test:Ref<TestModel>
    @prop({default:""})
    output:string
    @arrayProp({default:[],items:Object})
    argv:any[]
    @prop({default:0})
    status:number
    @prop()
    id:number
    @prop({default:0})
    time:number
    @prop()
    mode:string
}

class TestCollectionOutputModel {
    @prop({default:0})
    total:number
    @prop({default:0})
    success:number
    @prop({default:0})
    fail:number
    @prop({default:0})
    unknown:number
    @prop({default:0})
    time:number
}

class PollSendInfoModel extends BaseModel {
    @prop({default:""})
    user:string
    @prop({default:""})
    password:string
    @prop({default:""})
    smtp:string
    @prop({default:456})
    port:number
}

class PollPhoneInfoParamModel {
    @prop()
    key:string
    @prop()
    value:string
}

class PollPhoneInfoModel {
    @prop({default:"GET"})
    method:string
    @prop({default:""})
    sign:string
    @prop({default:""})
    baseUrl:string
    @arrayProp({default:[{
            key:"",
            value:""
        }],items:PollPhoneInfoParamModel})
    param:PollPhoneInfoParamModel[]
    @prop({default:""})
    bindParam:string
    @prop({default:","})
    split:string
    @prop({default:""})
    contentParam:string
}

export class PollModel extends BaseModel {
    @prop({ref:TestProjectModel})
    project:Ref<TestProjectModel>
    @arrayProp({itemsRef:UserModel,default:[]})
    users:Ref<UserModel>[]
    @prop({ref:UserModel})
    owner:Ref<UserModel>
    @arrayProp({items:Number,default:[]})
    date:number[]
    @arrayProp({items:Number,default:[]})
    time:number[]
    @prop()
    sendInfo:PollSendInfoModel
    @arrayProp({itemsRef:TestModel,default:[]})
    test:Ref<TestModel>[]
    @prop({default:""})
    baseUrl:string
    @prop({ref:ProjectModel})
    interProject:Ref<ProjectModel>
    @prop({default:0})
    failSend:number
    phoneInfo:PollPhoneInfoModel
}

export class TestCollectionModel extends BaseModel {
    @prop()
    name:string
    @prop({ref:TestProjectModel})
    project:Ref<TestProjectModel>
    @prop({ref:UserModel})
    user:Ref<UserModel>
    @arrayProp({_id:false,default:[],items:TestCollectionTestsModel})
    tests:TestCollectionTestsModel[]
    @prop({ref:PollModel})
    poll:Ref<PollModel>
    @prop()
    output:TestCollectionOutputModel
}
