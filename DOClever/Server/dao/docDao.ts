import pdf = require("html-pdf");
import markdown = require("markdown-it")

var md = markdown();
import con = require("../../config.json")
import path = require("path");
import jsdom = require("jsdom")
import {InstanceType} from 'typegoose';
var dom = jsdom.JSDOM;
var window = (new dom(`...`)).window;
var document = window.document;
import e = require("../util/error.json");
import util = require("../util/util");
import docProject = require("../model/docProjectModel");
import docGroup = require("../model/docGroupModel");
import doc = require("../model/docModel");
import team = require("../model/teamModel")
import teamGroup = require("../model/teamGroupModel")
import project = require("../model/projectModel")
import interfaceVersion = require("../model/interfaceVersionModel")
import interfaceModel = require("../model/interfaceModel")
import userModel = require("../model/userModel")
import apply = require("../model/applyModel")
import message = require("../model/messageModel")
import status = require("../model/statusModel")
import statusVersion = require("../model/statusVersionModel")
import {
    DocProjectModel,
    InterfaceModel,
    InterfaceVersionModel, ProjectBaseUrlsModel,
    ProjectModel, StatusModel,
    TeamModel,
    UserModel
} from "../model/types";
import {api, user} from "../routes/generateParams";
import docApi = require("../../Common/routes/doc")
import {keys} from "../../Common/transform";
import {DocGroupModel} from "../model/docGroupTypes";
import {DocModel} from "../model/docTypes";
import Instance = WebAssembly.Instance;
import ReadStream = NodeJS.ReadStream;
import {IKoa_ctx} from "../types/global";
class DocDao {
    async teamUserList(teamId:string) {
        let arrUser = await teamGroup.find({
            team: teamId
        })
        let arr:string[] = [];
        arrUser.forEach(function (obj) {
            return obj.users.forEach(function (obj) {
                arr.push(obj.user.toString());
            })
        })
        return arr;
    }

    async existUserInTeam(teamId:string, userId:string) {
        let arrUser = await teamGroup.find({
            team: teamId
        })
        let bFind = false;
        for (let obj of arrUser) {
            for (let obj1 of obj.users) {
                if (obj1.user.toString() == userId.toString()) {
                    bFind = true;
                    break;
                }
            }
            if (bFind) {
                break;
            }
        }
        if (bFind) {
            return true;
        } else {
            return false;
        }
    }
    async saveProject(name:string,dis:string,project:string,team:string,publicTeam:number,bPublic:number,userId:string) {
        let query: any = {
            name: name,
            dis: dis ?? ""
        }
        let obj:InstanceType<DocProjectModel>;
        if (project) {
            if (team) {
                query.team = team;
                query.publicTeam = publicTeam;
            } else {
                query["$unset"] = {
                    team: 1
                }
            }
            query.public = bPublic;
            obj = await docProject.findOneAndUpdate({
                _id: project
            }, query, {
                new: true
            })
        } else {
            query.owner = userId;
            query.totalSize = 10 * 1024 * 1024;
            if (team) {
                query.team = team;
            }
            obj = await docProject.create(query);
            obj._doc.userCount = 1;
            obj._doc.docCount = 0;
            obj._doc.own = 1;
            obj._doc.role = 0;
        }
        return obj
    }
    async projectList(userId:string) {
        let ret = <{
            join:InstanceType<DocProjectModel>[],
            create:InstanceType<DocProjectModel>[],
            public:InstanceType<DocProjectModel>[]
        }>{}
        let arr = await docProject.find({
            owner: userId,
            team: {
                $exists: false
            },
        }, null, {
            sort: "-createdAt"
        });
        for (let o of arr) {
            o._doc.own = 1;
            o._doc.role = 0;
            o._doc.docCount = await doc.count({
                project: o._id
            })
            o._doc.userCount = o.users.length + 1;
            delete o._doc.users;
        }
        ret.create = arr;
        arr = await docProject.find({
            users: userId,
            team: {
                $exists: false
            },
        }, null, {
            sort: "-createdAt"
        });
        for (let o of arr) {
            o._doc.role = 0;
            o._doc.docCount = await doc.count({
                project: o._id
            })
            o._doc.userCount = o.users.length + 1;
            delete o._doc.users;
        }
        ret.join = arr;
        arr = await docProject.find({
            public: 1,
            $or: [
                {
                    team: {
                        $exists: true
                    },
                },
                {
                    owner: {
                        $ne: userId
                    },
                    users: {
                        $ne: userId
                    },
                    team: {
                        $exists: false
                    },
                }
            ]
        }, null, {
            sort: "-createdAt"
        });
        for (let o of arr) {
            o._doc.role = 1;
            o._doc.docCount = await doc.count({
                project: o._id
            })
            o._doc.userCount = o.users.length + 1;
            delete o._doc.users;
        }
        ret.public = arr;
        return  ret
    }
    async projectInfo(project:string) {
        let objProject = await docProject.findOne({
            _id: project
        }, null, {
            populate: {
                path: "users",
                select: "name photo"
            }
        })
        if (!objProject) {
             throw e.docProjectNotFound;
        }
        objProject = await docProject.populate(objProject, {
            path: "owner",
            select: "name photo"
        })
        return objProject
    }
    async removeProject(project:string) {
        let arrDoc = await doc.find({
            project: project
        }, "-content");
        for (let obj of arrDoc) {
            obj.img.forEach(function (obj) {
                util.delImg(obj)
            })
            obj.file.forEach(function (obj) {
                util.delImg(obj)
            })
        }
        await doc.remove({
            project: project
        })
        await docGroup.remove({
            project: project
        })
        await docProject.remove({
            _id: project
        })
    }
    async saveGroup(name:string,project:string,parent?:string,group?:string) {
        let query: any = {
            name: name,
            project: project
        };
        let obj:InstanceType<DocGroupModel>;
        if (group) {
            if (parent) {
                query.parent = parent
            } else {
                query["$unset"] = {
                    parent: 1
                }
            }
            obj = await docGroup.findOneAndUpdate({
                _id: group
            }, query, {
                new: true
            })
        } else {
            if (parent) {
                query.parent = parent
            }
            obj = await docGroup.create(query);
            if (parent) {
                await docGroup.findOneAndUpdate({
                    _id: parent
                }, {
                    $addToSet: {
                        childGroup: obj._id
                    }
                })
            } else {
                await docProject.findOneAndUpdate({
                    _id: project
                }, {
                    $addToSet: {
                        childGroup: obj._id
                    }
                })
            }
        }
        return obj
    }
    async removeGroup(group:string) {
        let objGroup = await docGroup.findOne({
            _id: group
        })
        if (!objGroup) {
            throw e.docGroupNotFound
        }
        if (objGroup.parent) {
            await docGroup.findOneAndUpdate({
                _id: objGroup.parent
            }, {
                $pull: {
                    childGroup: objGroup._id
                }
            })
        }
        let size = 0;
        let __map = async function (obj) {
            if (obj.childGroup && obj.childGroup.length > 0) {
                let arrGroup = await docGroup.find({
                    _id: {
                        $in: obj.childGroup
                    }
                })
                for (let i = 0; i < arrGroup.length; i++) {
                    await __map(arrGroup[i]);
                }
            }
            if (obj.childDoc && obj.childDoc.length > 0) {
                let arrDoc = await doc.find({
                    _id: {
                        $in: obj.childDoc
                    }
                }, "-content -interface")
                for (let obj of arrDoc) {
                    for (let o of obj.img) {
                        size += (await util.getFileSize(o));
                        util.delImg(o)
                    }
                    for (let o of obj.file) {
                        size += (await util.getFileSize(o));
                        util.delImg(o)
                    }
                    await obj.remove();
                }
            }
            await obj.remove();
        }
        await __map(objGroup);
        let obj = await docProject.findOneAndUpdate({
            _id: objGroup.project
        }, {
            $inc: {
                useSize: -size
            }
        }, {
            new: true
        })
        return obj.useSize
    }
    async saveDoc(name:string,group:string,project:string,id:string,userId:string) {
        let objGroup = await docGroup.findOne({
            _id: group
        })
        if (!objGroup) {
            throw e.docGroupNotFound
        }
        let query: any = {
            name: name,
            group: group,
            project: project
        }
        let obj:InstanceType<DocModel>;
        if (id) {
            query.editor = userId;
            obj = await doc.findOneAndUpdate({
                _id: id
            }, query, {
                new: true
            })
        } else {
            query.owner = userId;
            query.editor = userId;
            obj = await doc.create(query);
            objGroup.childDoc.push(obj._id);
            await objGroup.save();
        }
        return obj
    }
    async docInfo(id:string) {

        let obj = await doc.findOne({
            _id:id
        }, null, {
            populate: {
                path: "owner",
                select: "name photo"
            }
        })
        if (!obj) {
            throw e.docNotFound
        }
        obj = await doc.populate(obj, {
            path: "editor",
            select: "name photo"
        });
        obj = await doc.populate(obj, {
            path: "project",
            select: "name team",
            populate: {
                path: "team",
                select: "name"
            }
        });
        return obj

    }
    async moveDoc(id:string,to:string,indexDoc:number) {
        let obj = await doc.findOne({
            _id: id
        });
        if (!obj) {
            throw e.docNotFound;
        }
        let objFrom, objTo;
        objFrom = await docGroup.findOne({
            _id: obj.group
        });
        if (!objFrom) {
            throw e.docGroupNotFound;
        }
        objTo = await docGroup.findOne({
            _id: to
        });
        if (!objTo) {
            throw e.docGroupNotFound;
        }
        let index;
        objFrom.childDoc.forEach(function (obj, i) {
            if (obj.toString() == id) {
                index = i;
            }
        })
        if (objFrom._id.toString() == objTo._id.toString()) {
            let obj1 = objFrom.childDoc[indexDoc];
            objFrom.childDoc.splice(indexDoc, 1, obj);
            objFrom.childDoc.splice(index, 1, obj1);
            await objFrom.save();
        } else {
            objFrom.childDoc.splice(index, 1);
            objTo.childDoc.splice(indexDoc, 0, obj)
            await objFrom.save();
            await objTo.save();
        }
        obj = await doc.findOneAndUpdate({
            _id: obj._id
        }, {
            group: to
        }, {
            new: true
        })
        return obj

    }
    async removeDoc(id:string) {

        let obj = await doc.findOne({
            _id: id
        })
        if (!obj) {
            throw e.docNotFound
        }
        await docGroup.findOneAndUpdate({
            _id: obj.group
        }, {
            $pull: {
                childDoc: obj._id
            }
        })
        let size = 0;
        for (let o of obj.img) {
            size += (await util.getFileSize(o));
            util.delImg(o)
        }
        for (let o of obj.file) {
            size += (await util.getFileSize(o));
            util.delImg(o)
        }
        await obj.remove();
        let obj1 = await docProject.findOneAndUpdate({
            _id: obj.project
        }, {
            $inc: {
                useSize: -size
            }
        }, {
            new: true
        })
        return obj1.useSize
    }
    async moveGroup(group:string,to:string,indexGroup:number) {

        let obj = await docGroup.findOne({
            _id: group
        });
        if (!obj) {
            throw e.docGroupNotFound
        }
        let objFrom, objTo;
        if (obj.parent) {
            objFrom = await docGroup.findOne({
                _id: obj.parent
            });
        } else {
            objFrom = await docProject.findOne({
                _id: obj.project
            });
        }
        if (to) {
            objTo = await docGroup.findOne({
                _id: to
            });
            if (!objTo) {
                throw e.docGroupNotFound
            }
        } else {
            objTo = await docProject.findOne({
                _id: obj.project
            });
            if (!objTo) {
                throw e.docProjectNotFound
            }
        }
        let index;
        objFrom.childGroup.forEach(function (obj, i) {
            if (obj.toString() == group) {
                index = i;
            }
        })
        if (objFrom._id.toString() == objTo._id.toString()) {
            let obj1 = objFrom.childGroup[indexGroup];
            objFrom.childGroup.splice(indexGroup, 1, obj);
            objFrom.childGroup.splice(index, 1, obj1);
            await objFrom.save();
        } else {
            objFrom.childGroup.splice(index, 1);
            objTo.childGroup.splice(indexGroup, 0, obj)
            await objFrom.save();
            await objTo.save();
        }
        if (to) {
            obj = await docGroup.findOneAndUpdate({
                _id: obj._id
            }, {
                parent: to
            }, {
                new: true
            })
        } else {
            obj = await docGroup.findOneAndUpdate({
                _id: obj._id
            }, {
                $unset: {
                    parent: 1
                }
            }, {
                new: true
            })
        }
        return obj

    }
    async addUser(user:string,project:string) {

        let objUser = await userModel.findOne({
            name: user
        })
        if (!objUser) {
            throw e.userNotFound;
        }
        let objProject = await docProject.findOne({
            _id: project
        })
        if (!objProject) {
            throw e.docProjectNotFound;
        }
        for (let u of objProject.users) {
            if (u.toString() == objUser._id.toString()) {
                throw e.userAlreadyInDoc;
            }
        }
        if (objProject.team) {
            let bExist = await this.existUserInTeam(objProject.team.toString(), objUser._id)
            if (!bExist) {
                throw e.userNotInTeam;
            }
        }
        await docProject.findOneAndUpdate({
            _id: project
        }, {
            $addToSet: {
                users: objUser._id
            }
        })
        return objUser
    }
    async removeUser(user:string,project:string) {

        let objUser = await userModel.findOne({
            _id: user
        })
        if (!objUser) {
            throw e.userNotFound;
        }
        let objProject = await docProject.findOne({
            _id: project
        })
        if (!objProject) {
            throw e.docProjectNotFound;
        }
        let bExist = false;
        for (let u of objProject.users) {
            if (u.toString() == user) {
                bExist = true;
            }
        }
        if (!bExist) {
            throw e.userNotInDoc;
        }
        await docProject.update({
            _id: project
        }, {
            $pull: {
                users: user
            }
        });
    }
    async quit(userId:string,project:string) {

        let obj = await docProject.findOne({
            _id: project
        });
        if (obj.owner.toString() == userId) {
            throw e.userForbidden;
        }
        let index = -1;
        for (let i = 0; i < obj.users.length; i++) {
            let u = obj.users[i];
            if (u.toString() == userId) {
                index = i;
                break;
            }
        }
        if (index == -1) {
            throw e.projectNotFound;
        } else {
            obj.users.splice(index, 1);
            await obj.save();
        }

    }
    async setUser(project:string,user:string) {

        let obj = await docProject.findOne({
            _id: project
        });
        if (!obj) {
            throw e.docProjectNotFound;
        }
        obj.users = JSON.parse(user);
        await obj.save();

    }
    async setOwner(user:string,project:string) {

        let obj = await userModel.findOne({
            _id: user
        })
        if (!obj) {
            throw e.userNotFound;
            return;
        }
        let objProject = await docProject.findOne({
            _id: project
        })
        if (!objProject) {
            throw e.docProjectNotFound;
        }
        let bInTeam = false;
        if (objProject.team) {
            let bIn = await this.existUserInTeam(objProject.team.toString(), user);
            if (!bIn) {
                throw e.userNotInTeam;
            } else {
                bInTeam = true;
            }
        }
        let bFind = false;
        for (let o of objProject.users) {
            if (o.toString() == user) {
                bFind = true;
                break;
            }
        }
        if (bFind) {
            await docProject.update({
                _id: project
            }, {
                owner: user,
                $pull: {
                    "users": user
                }
            })
        } else {
            if (bInTeam) {
                objProject.owner =  user as any;
                await objProject.save();
            } else {
                throw e.userNotInProject;
            }
        }
    }
    async structure(project:string) {

        let objProject = await docProject.findOne({
            _id: project
        })
        if (!objProject) {
            throw e.docProjectNotFound;
        }
        let __map = async function (obj) {
            if (obj.childGroup && obj.childGroup.length > 0) {
                let type;
                if (obj.users) {
                    type = docProject;
                } else {
                    type = docGroup;
                }
                obj = await type.populate(obj, {
                    path: "childGroup",
                });
                for (let i = 0; i < obj.childGroup.length; i++) {
                    obj.childGroup[i] = await __map(obj.childGroup[i]);
                }
            }
            if (obj.childDoc && obj.childDoc.length > 0) {
                obj = await docGroup.populate(obj, {
                    path: "childDoc",
                    select: "-content -img -file -interface"
                })
                for (let j = 0; j < obj.childDoc.length; j++) {
                    obj.childDoc[j] = await doc.populate(obj.childDoc[j], {
                        path: "owner",
                        select: "name"
                    })
                    obj.childDoc[j] = await doc.populate(obj.childDoc[j], {
                        path: "editor",
                        select: "name"
                    })
                }
            }
            return obj;
        }
        objProject = await __map(objProject);
        return  objProject.childGroup as DocGroupModel[];
    }
    async filterStructure(project:string,key:string,type:number) {

        let objProject = await docProject.findOne({
            _id: project
        })
        if (!objProject) {
            throw e.docProjectNotFound;
        }
        let __map = async function (obj) {
            if (obj.childGroup && obj.childGroup.length > 0) {
                let type;
                if (obj.users) {
                    type = docProject;
                } else {
                    type = docGroup;
                }
                obj = await type.populate(obj, {
                    path: "childGroup",
                });
                for (let i = 0; i < obj.childGroup.length; i++) {
                    obj.childGroup[i] = await __map(obj.childGroup[i]);
                }
            }
            obj.childGroup = obj.childGroup.filter(function (obj) {
                if (obj.childDoc.length > 0) {
                    return true;
                } else {
                    return false;
                }
            })
            if (obj.childDoc && obj.childDoc.length > 0) {
                let query: any = {
                    path: "childDoc",
                    select: "-content -img -file -interface",
                }
                if (key) {
                    if (type == 0) {
                        query.match = {
                            name: new RegExp(key, "i")
                        }
                    } else if (type == 1) {
                        query.match = {
                            content: new RegExp(key, "i")
                        }
                    } else if (type == 2) {
                        query.match = {
                            $or: [
                                {
                                    name: new RegExp(key, "i")
                                },
                                {
                                    content: new RegExp(key, "i")
                                }
                            ]
                        }
                    }
                }
                obj = await docGroup.populate(obj, query)
                for (let j = 0; j < obj.childDoc.length; j++) {
                    obj.childDoc[j] = await doc.populate(obj.childDoc[j], {
                        path: "owner",
                        select: "name"
                    })
                    obj.childDoc[j] = await doc.populate(obj.childDoc[j], {
                        path: "editor",
                        select: "name"
                    })
                }
            }
            return obj;
        }
        objProject = await __map(objProject);
        return objProject.childGroup as DocGroupModel[]
    }
    async filterList(name:string,teamId:string,userId:string) {
        let query: any = {
            name: new RegExp(name, "i")
        }
        if (teamId) {
            query.team = teamId;
            query["$or"] = [
                {
                    publicTeam: 1
                },
                {
                    $or: [
                        {
                            owner: userId
                        },
                        {
                            users: userId
                        }
                    ]
                }
            ]
        } else {
            query.team = {
                $exists: false
            }
            query["$or"] = [
                {
                    public: 1
                },
                {
                    $or: [
                        {
                            owner: userId
                        },
                        {
                            users: userId
                        }
                    ]
                }
            ]
        }
        let arr = await docProject.find(query, "_id name owner dis users", {
            sort: "createdAt"
        });
        let bManager = 0;
        if (teamId) {
            let obj = await team.findOne({
                _id: teamId
            });
            if (!obj) {
                throw e.teamNotFound;
            }
            let arr = await teamGroup.find({
                team: teamId,
            })
            let arrTeamGroup = arr;
            let objTeam = obj;
            let access:number
            if (objTeam.owner.toString() == userId) {
                access = 1;
            } else {
                access = 0;
                for (let o of arrTeamGroup) {
                    let bFind = false;
                    for (let o1 of o.users) {
                        if (o1.user.toString() == userId && o1.role == 0) {
                            access = 1;
                            bFind = true;
                            break;
                        }
                    }
                    if (bFind) {
                        break;
                    }
                }
            }
            bManager = access;
        }
        arr.forEach(function (obj) {
            if (obj.owner.toString() == userId) {
                obj._doc.open = 0;
            } else {
                let objFind = null;
                for (let o1 of obj.users) {
                    if (o1.toString() == userId) {
                        objFind = o1;
                        break;
                    }
                }
                if (team) {
                    if (bManager) {
                        obj._doc.open = 0;
                    } else if (objFind && objFind.role == 0) {
                        obj._doc.open = 0
                    } else {
                        obj._doc.open = 1;
                    }
                } else {
                    if (objFind && objFind.role == 0) {
                        obj._doc.open = 0
                    } else {
                        obj._doc.open = 1;
                    }
                }
            }
            delete obj._doc.users;
            delete obj._doc.owner;
        })
        return arr
    }
    async handleApply(applyId:string,projectId:string,state:number,userId:string) {

        let obj = await apply.findOne({
            _id: applyId
        }, null, {
            populate: {
                path: "from",
                select: "name"
            }
        });
        obj = await apply.populate(obj, {
            path: "to",
            select: "name"
        })
        if (!obj) {
            throw e.applyNotFound;
        } else if (obj.state != 0) {
            throw e.applyAlreadyHandle;
        }
        let objTeam = await team.findOne({
            _id: (<any>obj.from)._id
        })
        if (!objTeam) {
            throw e.teamNotFound;
        }
        obj.editor = userId as any;
        let objProject = await docProject.findOne({
            _id: projectId
        });
        if (!objProject) {
            throw e.docProjectNotFound;
        }
        if (objProject.team) {
            obj.state = 3;
            await obj.save();
            if (objProject.team.toString() == (<any>obj.to)._id.toString()) {
                throw e.projectAlreadyJoinTeam
            } else {
                throw e.projectAlreadyJoinTeam
            }

        } else {
            obj.state = state;
            if (state == 1) {
                let arrTeamUser = await this.teamUserList(objTeam._id);
                let arrProjectUser = objProject.users.map(function (obj) {
                    return obj.toString();
                });
                arrProjectUser.push(objProject.owner.toString());
                let arr = [];
                for (let o of arrProjectUser) {
                    if (arrTeamUser.indexOf(o) == -1) {
                        arr.push(o);
                    }
                }
                if (arr.length > 0) {
                    arr = arr.map(function (obj) {
                        return {
                            user: obj,
                            role: 1
                        }
                    })
                    let objGroup = await teamGroup.findOneAndUpdate({
                        name: "未命名",
                        team: objTeam._id
                    }, {
                        name: "未命名",
                        team: objTeam._id,
                        $addToSet: {
                            users: {
                                $each: arr
                            }
                        }
                    }, {
                        upsert: true,
                        setDefaultsOnInsert: true
                    })
                }
                objProject.team = objTeam._id;
                await objProject.save();
            }
            await message.create({
                name: state == 1 ? "您已同意文档项目加入团队" : "您已拒绝文档项目加入团队",
                dis: `您已${state == 1 ? "通过" : "拒绝"}文档项目${objProject.name}加入团队${(obj.from as UserModel).name}`,
                user: userId,
                type: 1
            })
            await obj.save();
            await apply.update({
                to: objProject._id,
                type: 4,
                state: 0
            }, {
                state: 3
            }, {
                multi: true
            })
        }

    }
    async getInterface(id:string) {

        let interfaceCurModel:typeof interfaceModel|typeof interfaceVersion = interfaceModel;
        let inter = await interfaceCurModel.findOne({
            _id: id
        });
        if (!inter) {
            interfaceCurModel = interfaceVersion;
            inter = await interfaceCurModel.findOne({
                _id: id
            });
            if (!inter) {
                throw e.interfaceNotFound;
            }
        }
        let obj:InstanceType<InterfaceModel> | InstanceType<InterfaceVersionModel> = await interfaceCurModel.populate(inter, {
            path: "project",
            select: "name baseUrls"
        })
        if (obj.group) {
            obj = await interfaceCurModel.populate(obj, {
                path: "group",
                select: "name"
            })
        }
        if (obj.owner) {
            obj = await interfaceCurModel.populate(obj, {
                path: "owner",
                select: "name"
            })
        }
        if (obj.editor) {
            obj = await interfaceCurModel.populate(obj, {
                path: "editor",
                select: "name"
            })
        }
        if ((obj as InstanceType<InterfaceVersionModel>).version) {
            obj = await interfaceCurModel.populate(obj, {
                path: "version",
                select: "name"
            })
        }
        let objProject = await project.findOne({
            _id: (obj.project as ProjectModel)._id
        }, "team", {
            populate: {
                path: "team",
                select: "name"
            }
        });
        if (objProject.team) {
            obj._doc.teamName = (objProject.team as TeamModel).name
        }
        return obj

    }
    async getInterfaceInfo(id:string) {
        let ret = <{
            baseUrls:ProjectBaseUrlsModel[],
            before:string,
            after:string,
            status:InstanceType<StatusModel>[]
        }>{};
        let interfaceCurModel = interfaceModel;
        let statusModel = status;
        let inter: any = await interfaceCurModel.findOne({
            _id: id
        });
        if (!inter) {
            interfaceCurModel = interfaceVersion;
            statusModel = statusVersion;
            inter = await interfaceCurModel.findOne({
                _id: id
            });
            if (!inter) {
                throw e.interfaceNotFound;
            }
        }
        let objProject = await project.findOne({
            _id: inter.project
        }, "baseUrls before after");
        ret.baseUrls = objProject.baseUrls;
        ret.before = objProject.before;
        ret.after = objProject.after;
        let query: any = {
            project: objProject._id
        }
        if (inter.version) {
            query.version = inter.version
        }
        let arr = await statusModel.find(query, null, {
            sort: "-createdAt"
        })
        ret.status = arr;
        return ret
    }
    async exportPdf(projectId:string) {

        let objProject = await docProject.findOne({
            _id: projectId
        })
        if (!objProject) {
            throw e.docProjectNotFound;
        }
        let html = "";
        let __map = async function (obj) {
            if (obj.childGroup && obj.childGroup.length > 0) {
                let type;
                if (obj.users) {
                    type = docProject;
                } else {
                    type = docGroup;
                }
                obj = await type.populate(obj, {
                    path: "childGroup",
                });
                for (let i = 0; i < obj.childGroup.length; i++) {
                    obj.childGroup[i] = await __map(obj.childGroup[i]);
                }
            }
            if (obj.childDoc && obj.childDoc.length > 0) {
                obj = await docGroup.populate(obj, {
                    path: "childDoc",
                    select: "name content"
                })
                for (let j = 0; j < obj.childDoc.length; j++) {
                    let d = obj.childDoc[j];
                    let str = "<div style='text-align: center;font-size: 20px'>" + d.name + "</div>"
                    let temp = md.render(d.content);
                    let div = document.createElement("div");
                    div.innerHTML = temp;
                    var arr = div.getElementsByTagName("img");
                    for (let i = 0; i < arr.length; i++) {
                        let o = arr[i];
                        o.style.maxWidth = "100%";
                        if (o.src.startsWith("/")) {
                            o.src = path.join('file://', con.filePath, o.src)
                        }
                    }
                    html += str + div.innerHTML + "<br><br>";
                }
            }
            return obj;
        }
        objProject = await __map(objProject);
        html = `
                <style>
                    * {
                        line-height: 1.5;
                    }
                    img {
                        max-width: 100%;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        text-align: center;
                    }
                    td{
                        border:1px solid #BBB;
                    }
                    th{
                        border:1px solid #BBB;
                    }
                    pre {
                        background-color: #f3f3f3;
                        padding: 10px;
                    }
                </style>
                <div style="text-align: center;font-size: 25px">${objProject.name}</div>
            ` + html;
        let headers:any={
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename*=UTF-8\'\'' + encodeURIComponent(objProject.name) + ".pdf",
            "Transfer-Encoding": "chunked",
            "Expires": 0,
            "Cache-Control": "must-revalidate, post-check=0, pre-check=0",
            "Content-Transfer-Encoding": "binary",
            "Pragma": "public",
        }
        async function _create(html:string){
            return new Promise( (resolve,reject) =>{
                pdf.create(html, {
                    border: {
                        "top": "0.3in",
                        "right": "0.2in",
                        "left": "0.2in",
                        "bottom": "0in"
                    },
                    footer: {
                        height: "15mm",
                        "contents": "<div style='color: gray;border-top: 1px lightgray solid;font-size: 13px;padding-top: 10px'>本pdf由<a href='http://doclever.cn'>DOClever</a>生成</div>"
                    },
                }).toStream(function (err, stream) {
                    resolve(stream)
                })
            })
        }
        let stream=await _create(html)
        return {headers,stream}
    }
}
export =new DocDao()










