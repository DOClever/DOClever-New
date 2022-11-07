import {
    IRes_User_ApplyList_Item,
    IRes_User_CreateQQ,
    IRes_User_HandleApply,
    IRes_User_Login,
    IRes_User_Save, IRes_User_Version
} from "./userRes";
import {ICommon_User_SendInfo} from "./types";

const api = {
    login: {
        "method": "POST",
        "path": "/user/login",
        "param": <{
            name?: string,
            password?: string,
            id?: string,
            qqid?: string,
            qqimg?: string
        }>{},
        "data": <IRes_User_Login>{},
    },
    createQQ: {
        "method": "POST",
        "path": "/user/createqq",
        "param": <{
            name: string,
            password: string,
            qqid: string,
            qqimg: string,
            question: string,
            answer: string,
            email: string
        }>{},
        "data": <IRes_User_CreateQQ>{},
    },
    save: {
        "method": "POST",
        "path": "/user/save",
        "param": <{
            userid?: string,
            name?: string,
            password?: string,
            sex?: string,
            age?: number,
            company?: string,
            photo?: string,
            phone?: string,
            qq?: string,
            email?: string,
            question?: string,
            answer?: string
        }>{},
        "data": <IRes_User_Save>{},
    },
    logout: {
        "method": "POST",
        "path": "/user/logout",
        "param": <{}>{},
        "data": {},
    },
    editPass: {
        "method": "PUT",
        "path": "/user/editpass",
        "param": <{
            userid: string,
            oldpass: string,
            newpass: string
        }>{},
        "data": {},

    },
    reset: {
        "method": "PUT",
        "path": "/user/reset",
        "param": <{
            name: string,
            password: string,
            answer: string
        }>{},
        "data": {},
    },
    question: {
        "method": "GET",
        "path": "/user/question",
        "param": <{
            name: string,
        }>{},
        "data": <string>{},
    },
    applyList: {
        "method": "GET",
        "path": "/user/applylist",
        "param": <{}>{},
        "data": <IRes_User_ApplyList_Item[]>[],

    },
    handleApply: {
        "method": "PUT",
        "path": "/user/handleapply",
        "param": <{
            apply: string,
            state: number
        }>{},
        "data": <IRes_User_HandleApply>{},

    },
    editSendInfo: {
        "method": "PUT",
        "path": "/user/sendinfo",
        "param": <{
            user: string,
            password: string,
            smtp: string,
            port: number
        }>{},
        "data": {},

    },
    sendInfo: {
        "method": "GET",
        "path": "/user/sendinfo",
        "param": <{}>{},
        "data": <ICommon_User_SendInfo>{},

    },
    version: {
        "method": "GET",
        "path": "/user/version",
        "param": <{}>{},
        "data":<IRes_User_Version> {},
    },
}

export = api
