import project=require("../model/projectModel")
import group=require("../model/groupModel")
import interfaceModel=require("../model/interfaceModel")
import interfaceVersion=require("../model/interfaceVersionModel")
import interfaceSnapshot=require("../model/interfaceSnapshotModel")
import groupVersion=require("../model/groupVersionModel")
import version=require("../model/versionModel")
import teamGroup=require("../model/teamGroupModel")
import statusVersion=require("../model/statusVersionModel")
import status=require("../model/statusModel")
import test=require("../model/testModel")
import testModule=require("../model/testModuleModel")
import testGroup=require("../model/testGroupModel")
import {InstanceType} from "typegoose";
import {
    GroupModel,
    GroupVersionModel,
    InterfaceModel,
    InterfaceSnapshotModel,
    InterfaceVersionModel,
    ProjectModel, TeamGroupModel, TeamModel, TestGroupModel, TestModel, TestModuleModel, TestProjectModel, VersionModel
} from "../model/types";
export interface IGroupValidateUserRet {
    interfaceModel:typeof interfaceModel|typeof interfaceVersion
    groupModel:typeof group|typeof groupVersion
    objProject:InstanceType<ProjectModel>
    objGroup:InstanceType<GroupModel> | InstanceType<GroupVersionModel>
}

export interface IInterfaceValidateUserRet {
    interfaceModel:typeof interfaceVersion|typeof interfaceModel|typeof interfaceSnapshot
    groupModel:typeof group|typeof groupVersion
    objProject:InstanceType<ProjectModel>
    objGroup:InstanceType<GroupModel> | InstanceType<GroupVersionModel>
    objInterface:InstanceType<InterfaceModel> | InstanceType<InterfaceVersionModel> |InstanceType<InterfaceSnapshotModel>
}

export interface IProjectValidateUserRet {
    interfaceModel:typeof interfaceModel|typeof interfaceVersion
    groupModel:typeof group|typeof groupVersion
    statusModel:typeof status|typeof statusVersion
    objProject:InstanceType<ProjectModel>
    objVersion:InstanceType<VersionModel>
}

export interface ITeamValidateUserRet {
    arrTeamGroup:InstanceType<TeamGroupModel>[],
    objTeam:InstanceType<TeamModel>,
    access:0|1,

}

export interface ITestValidateUserRet {
    moduleModel:typeof testModule,
    groupModel:typeof testGroup,
    testModel:typeof test
    objModule:InstanceType<TestModuleModel>,
    objGroup:InstanceType<TestGroupModel>,
    objTest:InstanceType<TestModel>,
    objProject:InstanceType<TestProjectModel>
}
export interface IVersionValidateUserRet {
    objVersion:InstanceType<VersionModel>,
    objProject:InstanceType<ProjectModel>
}

export const ctxFake={
    headers:{},
    cookies:{get:function (name:string) {
            return ""
        }
    }
}
