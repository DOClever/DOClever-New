import con = require("../../../config.json")
import e = require("../../util/error.json");
import util = require("../../util/util");
import {api, user} from "../generateParams";
import docApi = require("../../../Common/routes/doc")
import {keys} from "../../../Common/transform";
import docDao=require("../../dao/docDao");
import {IKoa_ctx} from "../../types/global";

class Doc {
    constructor(private doc=docDao) {
    }
    @user
    @api(docApi.editProject, keys<typeof docApi.editProject.param>())
    async saveProject(ctx:IKoa_ctx<typeof docApi.editProject>) {
        let obj=await this.doc.saveProject(ctx.state.p.name,ctx.state.p.dis,ctx.state.p.project,ctx.state.p.team,ctx.state.p.publicteam,ctx.state.p.public,ctx.state.user._id)
        return obj
    }

    @user
    @api(docApi.projectList, keys<typeof docApi.projectList.param>())
    async projectList(ctx:IKoa_ctx<typeof docApi.projectList>) {
        let obj=await this.doc.projectList(ctx.state.user._id)
        return obj
    }

    @user
    @api(docApi.project, keys<typeof docApi.project.param>())
    async projectInfo(ctx:IKoa_ctx<typeof docApi.project>) {
        let obj=await this.doc.projectInfo(ctx.state.p.project)
        return obj
    }

    @user
    @api(docApi.removeProject, keys<typeof docApi.removeProject.param>())
    async removeProject(ctx:IKoa_ctx<typeof docApi.removeProject>) {
        await this.doc.removeProject(ctx.state.p.project)
    }

    @user
    @api(docApi.editGroup, keys<typeof docApi.editGroup.param>())
    async saveGroup(ctx:IKoa_ctx<typeof docApi.editGroup>) {
        let obj=await this.doc.saveGroup(ctx.state.p.name,ctx.state.p.project,ctx.state.p.parent,ctx.state.p.group)
        return obj
    }

    @user
    @api(docApi.removeGroup, keys<typeof docApi.removeGroup.param>())
    async removeGroup(ctx:IKoa_ctx<typeof docApi.removeGroup>) {
        let obj=await this.doc.removeGroup(ctx.state.p.group)
        return obj
    }

    @user
    @api(docApi.editDoc, keys<typeof docApi.editDoc.param>())
    async saveDoc(ctx:IKoa_ctx<typeof docApi.editDoc>) {
        let obj=await this.doc.saveDoc(ctx.state.p.name,ctx.state.p.group,ctx.state.p.project,ctx.state.p.id,ctx.state.user._id.toString())
        return obj
    }

    @user
    @api(docApi.doc, keys<typeof docApi.doc.param>())
    async docInfo(ctx:IKoa_ctx<typeof docApi.doc>) {
        let obj=await this.doc.docInfo(ctx.state.p.id)
        return obj
    }

    @user
    @api(docApi.removeDoc, keys<typeof docApi.removeDoc.param>())
    async removeDoc(ctx:IKoa_ctx<typeof docApi.removeDoc>) {
        let obj=await this.doc.removeDoc(ctx.state.p.id)
        return obj
    }

    @user
    @api(docApi.moveGroup, keys<typeof docApi.moveGroup.param>())
    async moveGroup(ctx:IKoa_ctx<typeof docApi.moveGroup>) {
        let obj=await this.doc.moveGroup(ctx.state.p.group,ctx.state.p.to,ctx.state.p.index)
        return obj
    }

    @user
    @api(docApi.moveDoc, keys<typeof docApi.moveDoc.param>())
    async moveDoc(ctx:IKoa_ctx<typeof docApi.moveDoc>) {
        let obj=await this.doc.moveDoc(ctx.state.p.id,ctx.state.p.to,ctx.state.p.index)
        return obj

    }

    @user
    @api(docApi.addUser, keys<typeof docApi.addUser.param>())
    async addUser(ctx:IKoa_ctx<typeof docApi.addUser>) {
        let obj=await this.doc.addUser(ctx.state.p.user,ctx.state.p.project)
        return obj

    }

    @user
    @api(docApi.removeUser, keys<typeof docApi.removeUser.param>())
    async removeUser(ctx:IKoa_ctx<typeof docApi.removeUser>) {
        let obj=await this.doc.removeUser(ctx.state.p.user,ctx.state.p.project)
        return obj
    }

    @user
    @api(docApi.quit, keys<typeof docApi.quit.param>())
    async quit(ctx:IKoa_ctx<typeof docApi.quit>) {
        await this.doc.quit(ctx.state.user._id.toString(),ctx.state.p.project)
    }

    @user
    @api(docApi.editUser, keys<typeof docApi.editUser.param>())
    async setUser(ctx:IKoa_ctx<typeof docApi.editUser>) {
        await this.doc.setUser(ctx.state.p.project,ctx.state.p.user)

    }

    @user
    @api(docApi.setOwner, keys<typeof docApi.setOwner.param>())
    async setOwner(ctx:IKoa_ctx<typeof docApi.setOwner>) {
        await this.doc.setOwner(ctx.state.p.user,ctx.state.p.project)

    }

    @user
    @api(docApi.structure, keys<typeof docApi.structure.param>())
    async structure(ctx:IKoa_ctx<typeof docApi.structure>) {
        let obj=await this.doc.structure(ctx.state.p.project)
        return obj
    }

    @user
    @api(docApi.filterStructure, keys<typeof docApi.filterStructure.param>())
    async filterStructure(ctx:IKoa_ctx<typeof docApi.filterStructure>) {
        let obj=await this.doc.filterStructure(ctx.state.p.project,ctx.state.p.key,ctx.state.p.type)
        return obj
    }

    @user
    @api(docApi.filterList, keys<typeof docApi.filterList.param>())
    async filterList(ctx:IKoa_ctx<typeof docApi.filterList>) {
        let obj=await this.doc.filterList(ctx.state.p.name,ctx.state.p.team,ctx.state.user._id.toString())
        return obj

    }

    @user
    @api(docApi.handleApply, keys<typeof docApi.handleApply.param>())
    async handleApply(ctx:IKoa_ctx<typeof docApi.handleApply>) {
        await this.doc.handleApply(ctx.state.p.apply,ctx.state.p.project,ctx.state.p.state,ctx.state.user._id.toString())

    }

    @user
    @api(docApi.interface, keys<typeof docApi.interface.param>())
    async getInterface(ctx:IKoa_ctx<typeof docApi.interface>) {
        let obj=await this.doc.getInterface(ctx.state.p.id)
        return obj

    }

    @user
    @api(docApi.interfaceInfo, keys<typeof docApi.interfaceInfo.param>())
    async getInterfaceInfo(ctx:IKoa_ctx<typeof docApi.interfaceInfo>) {
        let obj=await this.doc.getInterfaceInfo(ctx.state.p.id)
        return obj

    }

    @user
    @api(docApi.exportpdf, keys<typeof docApi.exportpdf.param>())
    async exportPdf(ctx:IKoa_ctx<typeof docApi.exportpdf>) {
        let {headers,stream}=await this.doc.exportPdf(ctx.state.p.project)
        ctx.set(headers)
        return stream
    }
}

export = new Doc;










