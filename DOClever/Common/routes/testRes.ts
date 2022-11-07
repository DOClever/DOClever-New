import {
    ICommon_Interface,
    ICommon_Poll, ICommon_Project, ICommon_Status,
    ICommon_Team,
    ICommon_Test, ICommon_TestCollection, ICommon_TestCollection_Output, ICommon_TestCollection_Test,
    ICommon_TestGroup,
    ICommon_TestModule,
    ICommon_TestProject,
    ICommon_User, ICommon_Version
} from "./types";
import {IRes_Interface_Create_List} from "./interfaceRes";
import {resolveSrv} from "dns";

export interface IRes_Test_EditTest extends Omit<ICommon_Test,"module"|"group">{
    project:string
    module:{
        _id:string,
        name:string
    }
    group:{
        _id:string,
        name:string
    }
    owner:string
    editor:string
    user:string
}

export interface IRes_Test_List_Test {
    name:string
    id:string
    _id:string
    status:number
    group:{
        _id:string,
        name:string
    }
    user:string
    module:{
        _id:string,
        name:string
    }
}

export interface IRes_Test_List_Group extends ICommon_TestGroup{
    module:string
    project:string
    user:string
    data:IRes_Test_List_Test[]
}

export interface IRes_Test_List_Module extends ICommon_TestModule{
    project:string
    id:string
    user:string,
    data:IRes_Test_List_Group[]
}

export interface IRes_Test_Info_Info extends Omit<ICommon_TestProject,"owner"|"users"> {
    users:{
        _id:string,
        name:string,
        photo:string
    }[]
    owner: {
        _id:string,
        name:string,
        photo:string
    }
    team:string
    cooperation:{
        user: string
        users: string[]
    }[]
}

export type IRes_Test_Info_Test =IRes_Test_List_Module
export interface IRes_Test_Info_Collection extends ICommon_TestCollection {
    project:string
    user:string
}

export interface IRes_Test_Info {
    user:string,
    info:IRes_Test_Info_Info
    testList:IRes_Test_Info_Test[],
    collectionList:IRes_Test_Info_Collection[]
}

export interface IRes_Test_Test extends ICommon_Test{
    project:string
    module:string
    group:string
    owner:string
    editor:string
    user:string
}

export interface IRes_Test_ProjectList_Create_Item extends Omit<ICommon_TestProject,"users">{
    owner: string
    team:string
    cooperation:{
        user: string
        users: string[]
    }[]
    userCount:number,
    testCount:number,
    role:number,
    own:number
}

export type IRes_Test_ProjectList_Join_Item =IRes_Test_ProjectList_Create_Item

export interface IRes_Test_ProjectList {
    create:IRes_Test_ProjectList_Create_Item[],
    join:IRes_Test_ProjectList_Join_Item[]
}

export interface IRes_Test_EditProject extends ICommon_TestProject{
    users:string[]
    owner:string
    team:string
    cooperation:{
        user: string
        users:string[]
    }[],
    userCount?:number,
    testCount?:number,
    own?:number,
    role?:number
}

export interface IRes_Test_FilterList_Item {
    _id:string
    name:string
    dis:string
}

export type IRes_Test_InterfaceList_InterfaceList=IRes_Interface_Create_List
export interface IRes_Test_InterfaceList_Version {
    _id:string,
    name:string,
    data:IRes_Test_InterfaceList_InterfaceList
}

export interface IRes_Test_InterfaceList_Project {
    _id:string,
    name:string,
    data:IRes_Test_InterfaceList_Version[]
}

export interface IRes_Test_InterfaceList_Team {
    _id:string,
    name:string,
    access:number,
    data:IRes_Test_InterfaceList_Project[]
}



export interface IRes_Test_Interface_Interface extends Omit<ICommon_Interface,"project"|"group"|"owner"|"editor">{
    version:string,
    snapshotCreator:string,
    project:{
        _id:string,
        name:string
    },
    group:{
        _id:string,
        name:string
    },
    owner:{
        _id:string,
        name:string
    },
    editor:{
        _id:string,
        name:string
    }
}

export interface IRes_Test_Interface_Status extends ICommon_Status{
    project:string
    version:string
}

export interface IRes_Test_Interface {
    interface:IRes_Test_Interface_Interface,
    baseUrls:any[],
    status:IRes_Test_Interface_Status
}

export interface IRes_Test_UrlList_Item {
    _id:string,
    name:string,
    data:{
        _id:string,
        name:string,
        env:string
    }[]
}

export interface IRes_Test_InterfaceProject {
    _id:string,
    baseUrls:any[],
    after:string,
    before:string
}

export interface IRes_Test_EditCollection extends ICommon_TestCollection{
    project:string
    user:string
    poll:string
}

export interface IRes_Test_CollectionList_Item {
    _id:string,
    name:string,
    project:string,
    user:string
}

export interface IRes_Test_Collection_Test_Test extends Omit<ICommon_Test,"module"|"group"> {
    project:string
    module:{
        _id:string,
        name:string
    }
    group:{
        _id:string,
        name:string
    }
    owner:string
    editor:string
    user:string
}

export interface IRes_Test_Collection_Test extends Omit<ICommon_TestCollection_Test,"test"> {
    test:IRes_Test_Collection_Test_Test
}

export interface IRes_Test_Collection extends Omit<ICommon_TestCollection,"tests"> {
    project:string
    user:string
    tests:IRes_Test_Collection_Test[]
    poll:string
}

export interface IRes_Test_AllGroupList_Item {
    _id:string,
    name:string,
    children:{
       _id:string,
       name:string,
       children : {
          _id:string,
          name:string
       }[]
    }[]
}

export interface IRes_Test_AllList_Item {
    _id:string,
    name:string,
    children:{
        _id:string,
        name:string,
        children : {
            _id:string,
            name:string
            children:{
                _id:string,
                name:string
            }[]
        }[]
    }[]
}

export interface IRes_Test_ImportProject extends ICommon_TestProject{
    users: string[]
    owner: string
    team:string
    cooperation:{
        user: string
        users:string[]
    }[],
    role:number,
    userCount:number,
    testCount:number,
    own:number
}

export interface IRes_Test_ImportModule extends ICommon_TestModule{
    project:string
    user:string
}

export interface IRes_Test_ImportGroup extends ICommon_TestGroup{
    module:string
    project:string
    user:string
}

export interface IRes_Test_ImportTest extends ICommon_Test{
    project:string
    module:string
    group:string
    owner:string
    editor:string
    user:string
}

export type IRes_Test_PasteTest =IRes_Test_ImportTest