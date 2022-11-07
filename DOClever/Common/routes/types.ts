

export interface ICommon_Base {
    _id:string,
    createdAt:string,
    updatedAt:string
}

export interface ICommon_User_SendInfo {
    user:string
    password:string
    smtp:string
    port:number
}

export interface ICommon_User extends ICommon_Base{
    name:string
    password:string
    sex:string
    age:number
    company:string
    photo:string
    phone:string
    state:number
    qq:string
    email:string
    loginCount:number
    lastLoginDate:string
    question:string
    answer:string
    qqId:string
    sendInfo:ICommon_User_SendInfo
}

export interface ICommon_Team_Notice_Item {
    content:string
    date:string
}

export interface ICommon_Team extends ICommon_Base {
    name:string
    dis:string
    owner:ICommon_User | string
    notice:ICommon_Team_Notice_Item[]
}

export interface ICommon_Project_BaseUrl {
    remark?:string
    url:string
    env?:{
        key:string
        value:string
        remark?:string
    }[]
}

export interface ICommon_Project extends ICommon_Base {
    name:string
    dis:string
    baseUrls: ICommon_Project_BaseUrl[]
    owner:ICommon_User | string
    users:{
        user:ICommon_User | string
        role:number
        option:any
    }[]
    before:string
    after:string
    team:ICommon_Team |string
    source:{type:number,url?:string}
    public:number
}

export interface ICommon_DocGroup extends ICommon_Base {
    name:string
    parent:ICommon_DocGroup | string
    project:ICommon_DocProject | string
    childGroup:ICommon_DocGroup[] | string[]
    childDoc:ICommon_Doc[] | string[]
}

export interface ICommon_Doc extends ICommon_Base {
    name:string
    group:ICommon_DocGroup |string
    project:ICommon_DocProject |string
    owner:ICommon_User | string
    editor:ICommon_User | string
    content:string
    img:any[]
    file:any[]
    interface:string[]
}

export interface ICommon_DocProject extends ICommon_Base {
    name:string
    dis:string
    users:ICommon_User[] | string[]
    owner:ICommon_User | string
    totalSize:number
    useSize:number
    childGroup:ICommon_DocGroup[] | string[]
    team:ICommon_Team |string
    publicTeam:number
    public:number
}

export interface ICommon_TestProject extends ICommon_Base {
    name:string
    dis:string
    users:ICommon_User[] | string[]
    owner:ICommon_User | string
    team:ICommon_Team |string
    cooperation:{
        user:ICommon_User | string
        users:ICommon_User[] | string[]
    }[]
}


export interface ICommon_Statistic extends ICommon_Base {
    date:string
    interface:number
    project:number
    team:number
    user:number
    userRegister:number
    userLogin:number
}

export interface ICommon_Article extends ICommon_Base {
    title:string
    content:string
    project:ICommon_Project|string
    creator:ICommon_User|string
}

export interface ICommon_Version extends ICommon_Base{
    version:string
    dis:string
    project:ICommon_Project|string
    creator:ICommon_User|string
    baseUrls:any[]
    before:string
    after:string
    source:object
}

export interface ICommon_Group extends ICommon_Base{
    name:string
    project:ICommon_Project|string
    type:number
    id:string
    parent:string
    delete:number
    sort:number
    version:ICommon_Version|string
}

export interface ICommon_Interface extends ICommon_Base{
    name:string
    project:ICommon_Project|string
    group:ICommon_Group|string
    url:string
    remark:string
    method:string
    param:any[]
    owner:ICommon_User|string
    editor:ICommon_User|string
    mock:string
    finish:number
    before:object
    after:object
    id:string
    delete:number
    sort:number
    version:ICommon_Version|string,
    groupType:string,
    snapshot:string,
    snapshotCreator:ICommon_User|string
}

export interface ICommon_Status extends ICommon_Base{
    name:string
    project:ICommon_Project|string
    data:any[]
    id:string,
    version:string|ICommon_Version
}

export interface ICommon_Example extends ICommon_Base {
    name:string
    project:ICommon_Project|string
    interfaceType:string
    interface:ICommon_Interface|string
    owner:ICommon_User|string
    paramId:string
    param:any
}

export interface ICommon_Message extends ICommon_Base {
    name:string
    dis:string
    user:ICommon_User|string
    type:number
    read:number
}


export interface ICommon_Poll extends ICommon_Base {
    project:ICommon_TestProject|string
    users:ICommon_User[]|string[]
    owner:ICommon_User|string
    date:number[]
    time:number[]
    sendInfo:{
        user:string
        password:string
        smtp:string
        port:number
    }
    test:ICommon_Test[]|string[]
    baseUrl:string
    interProject:ICommon_Project|string
    failSend:number
    phoneInfo:{
        method:string
        sign:string
        baseUrl:string
        param:{
            key:string
            value:string
        }[]
        bindParam:string
        split:string
        contentParam:string
    }
}

export interface ICommon_Template extends ICommon_Base {
    name:string
    project:ICommon_Project|string
    url:string
    remark:string
    method:string
    param:any[]
    version:ICommon_Version|string
}

export interface ICommon_Test extends ICommon_Base {
    name:string
    project:ICommon_TestProject|string
    module:ICommon_TestModule|string
    group:ICommon_TestGroup|string
    remark:string
    owner:ICommon_User|string
    editor:ICommon_User|string
    status:number
    code:string
    ui:any[]
    output:string
    id:string
    user:ICommon_User|string
}

export interface ICommon_TestModule extends ICommon_Base {
    name:string
    project:ICommon_TestProject|string
    id:string
    user:ICommon_User|string
}

export interface ICommon_TestGroup extends ICommon_Base {
    name:string
    module:ICommon_TestModule|string
    project:ICommon_TestProject|string
    id:string
    user:ICommon_User|string
}

export interface ICommon_Apply extends ICommon_Base {
    dis:string
    fromType:"User"|"Project"|"Team"|"DocProject"|"TestProject"
    from:ICommon_User|ICommon_Project|ICommon_Team|ICommon_DocProject|ICommon_TestProject|string
    toType:"User"|"Project"|"Team"|"DocProject"|"TestProject"
    to:ICommon_User|ICommon_Project|ICommon_Team|ICommon_DocProject|ICommon_TestProject|string
    type:0|1|2|3|4|5|6|7      //0 拉人  1 拉项目  2 人员申请加入  3  项目申请加入 4 拉文档  5 文档申请加入 6 拉测试  7 测试申请加入
    state:0|1|2|3     //0 申请中  1 同意  2 拒绝  3 忽略
    creator:ICommon_User|string
    editor:ICommon_User|string
    relatedData:any
}

export interface ICommon_TeamGroup_User {
    user:ICommon_User|string,
    role:number
}

export interface ICommon_TeamGroup extends ICommon_Base{
    name:string
    users:ICommon_TeamGroup_User[]
    team:ICommon_Team|string
}

export interface ICommon_TestCollection_Test {
    test:ICommon_Test|string
    output:string
    argv:any[]
    status:number
    id:number
    time:number
    mode:string
}

export interface ICommon_TestCollection_Output {
    total:number
    success:number
    fail:number
    unknown:number
    time:number
}
export interface ICommon_TestCollection extends ICommon_Base {
    name:string
    project:ICommon_TestProject|string
    user:ICommon_User|string
    tests:ICommon_TestCollection_Test[]
    poll:ICommon_Poll|string
    output:ICommon_TestCollection_Output
}