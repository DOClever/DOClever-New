import {
    ICommon_DocProject,
    ICommon_Project,
    ICommon_Statistic,
    ICommon_Team,
    ICommon_TestProject,
    ICommon_User
} from "./types"
import {
    IRes_Admin_GetProject,
    IRes_Admin_ProjectList,
    IRes_Admin_ProjectUserList, IRes_Admin_TeamProjectList_Project,
    IRes_Admin_TeamPullProject
} from "./adminRes";
const api = {
    login: {
        "method": "POST",
        "path": "/admin/login",
        "param": <{
            name: string,
            password: string
        }>{},
        "data": {},
    },
    logout: {
        "method": "POST",
        "path": "/admin/logout",
        "param": <{}>{},
        "data": {},
    },
    userStatistics: {
        "method": "GET",
        "path": "/admin/userstatistics",
        "param": <{}>{},
        "data": <{
            total:number,
            register:number,
            login:number
        }>{},


    },
    userList: {
        "method": "GET",
        "path": "/admin/userlist",
        "param": <{
            type: number,       //0  今日注册   1  今天登陆   2 登陆最多 3  用户搜索
            page: number,
            key?: string
        }>{},
        "data": <ICommon_User[]>[],

    },
    userInfo: {
        "method": "GET",
        "path": "/admin/userinfo",
        "param": <{
            id: string
        }>{},
        "data": <ICommon_User>{},


    },
    editUser: {
        "method": "POST",
        "path": "/admin/user",
        "param": <{
            id?: string,
            name: string,
            password: string,
            sex?: string,
            age?: number,
            company?: string,
            photo?: string,
            phone?: string,
            qq?: string,
            email?: string,
            state?: number,
            question: string,
            answer: string,
        }>{},
        "data": <ICommon_User>{},


    },
    removeUser: {
        "method": "DELETE",
        "path": "/admin/user",
        "param": <{
            id: string
        }>{},
        "data": {},


    },
    projectStatistics: {
        "method": "GET",
        "path": "/admin/projectstatistics",
        "param": <{}>{},
        "data": <{
            interfaceTotal: number,
            interfaceToday: number,
            docTotal: number,
            docToday: number,
            testTotal: number,
            testToday: number
        }>{},


    },
    projectList: {
        "method": "GET",
        "path": "/admin/projectlist",
        "param": <{
            type: number,       //0  今日创建   1  项目搜索
            page: number,
            key?:string,
            category: number
        }>{},
        "data": <IRes_Admin_ProjectList>[],


    },
    getProject: {
        "method": "GET",
        "path": "/admin/project",
        "param": <{
            id: string,
            category: number
        }>{},
        "data": <IRes_Admin_GetProject>{},


    },
    editProject: {
        "method": "PUT",
        "path": "/admin/project",
        "param": <{
            id: string,
            name: string,
            dis?: string,
            public?: number,
            category: number
        }>{},
        "data": <ICommon_Project | ICommon_DocProject | ICommon_TestProject>{},


    },
    removeProject: {
        "method": "DELETE",
        "path": "/admin/project",
        "param": <{
            id: string,
            category: number
        }>{},
        "data": {},
    },
    teamStatistics: {
        "method": "GET",
        "path": "/admin/teamstatistics",
        "param": <{}>{},
        "data": <{
            total:number,
            today:number
        }>{},


    },
    teamList: {
        "method": "GET",
        "path": "/admin/teamlist",
        "param": <{
            type: number,       //0  今日创建   1  团队搜索
            page: number,
            key?: string
        }>{},
        "data": <ICommon_Team[]>[],


    },
    teamInfo: {
        "method": "GET",
        "path": "/admin/teaminfo",
        "param": <{
            id: string
        }>{},
        "data": <ICommon_Team>{},


    },
    removeTeam: {
        "method": "DELETE",
        "path": "/admin/team",
        "param": <{
            id: string,
        }>{},
        "data": {},


    },
    interfaceStatistics: {
        "method": "GET",
        "path": "/admin/interfacestatistics",
        "param": <{}>{},
        "data": <{
            interface:{
                total:number,
                today:number
            },
            doc:{
                total:number,
                today:number
            },
            test:{
                total:number,
                today:number
            }
        }>{},


    },
    editPassword: {
        "method": "PUT",
        "path": "/admin/password",
        "param": <{
            old: string,
            password: string
        }>{},
        "data": {},


    },
    userProjectList: {
        "method": "GET",
        "path": "/admin/userprojectlist",
        "param": <{
            id: string
        }>{},
        "data": <{
            own:ICommon_Project[],
            join:ICommon_Project[]
        }>{},


    },
    userTeamList: {
        "method": "GET",
        "path": "/admin/userteamlist",
        "param": <{
            id: string
        }>{},
        "data": <{
            own:ICommon_Team[],
            join:ICommon_Team[]
        }>{},


    },
    removeUserProject: {
        "method": "DELETE",
        "path": "/admin/userproject",
        "param": <{
            id: string
        }>{},
        "data": {},


    },
    removeUserTeam: {
        "method": "DELETE",
        "path": "/admin/userteam",
        "param": <{
            id: string
        }>{},
        "data": {},


    },
    editUserProjectOwn: {
        "method": "PUT",
        "path": "/admin/userprojectown",
        "param": <{
            id: string,
            user: string,
            category: number
        }>{},
        "data": {},


    },
    editUserTeamOwn: {
        "method": "PUT",
        "path": "/admin/userteamown",
        "param": <{
            id: string,
            user: string
        }>{},
        "data": <ICommon_User>{},


    },
    userQuitProject: {
        "method": "PUT",
        "path": "/admin/userquitproject",
        "param": <{
            id: string,
            user: string
        }>{},
        "data": {},


    },
    userQuitTeam: {
        "method": "PUT",
        "path": "/admin/userquitteam",
        "param": <{
            id: string,
            user: string
        }>{},
        "data": {},


    },
// {
//     "method":"GET",
//     "path":"/admin/userteamuser",
//     "param":<{
//         id:string
//     },
//     "data":string,
//     admin:1,
//
// },
    addProject: {
        "method": "POST",
        "path": "/admin/project",
        "param": <{
            name: string,
            dis?: string,
            public?: string,
            owner: string,
            users?:string,
            category: number
        } > {},
        "data": {},


    },
    editProjectUser: {
        "method": "PUT",
        "path": "/admin/projectuser",
        "param": <{
            id: string,
            users: string,
            category: number
        }>{},
        "data": {},


    },
    addTeam: {
        "method": "POST",
        "path": "/admin/team",
        "param": <{
            name: string,
            dis?: string,
            owner:string,
            users?: string,
        }>{},
        "data": {},


    },
    teamUserList: {
        "method": "GET",
        "path": "/admin/teamuserlist",
        "param": <{
            id: string
        }>{},
        "data": <{
            _id:string,
            name:string,
            users:{
                user:{
                    name:string,
                    _id:string,
                    photo:string
                },
                role:number
            }
        }[]>[],


    },
    editTeam: {
        "method": "PUT",
        "path": "/admin/team",
        "param": <{
            id:string,
            name: string,
            dis?: string
        }>{},
        "data": {},


    },
    editTeamGroup: {
        "method": "POST",
        "path": "/admin/teamgroup",
        "param": <{
            id?: string,
            group?: string,
            name: string
        }>{},
        "data": {},


    },
    addTeamUser: {
        "method": "POST",
        "path": "/admin/addteamuser",
        "param": <{
            id: string,
            group: string,
            user: string,
            role: number
        }>{},
        "data": <ICommon_User>{},


    },
    removeTeamGroup: {
        "method": "DELETE",
        "path": "/admin/teamgroup",
        "param": <{
            group: string
        }>{},
        "data": {},


    },
    removeTeamUser: {
        "method": "DELETE",
        "path": "/admin/teamuser",
        "param": <{
            id: string,
            user: string
        }>{},
        "data": {},


    },
    editTeamUser: {
        "method": "PUT",
        "path": "/admin/teamuser",
        "param": <{
            id: string,
            user: string,
            role: number
        }>{},
        "data": {},


    },
    moveTeamUser: {
        "method": "PUT",
        "path": "/admin/moveteamuser",
        "param": <{
            id: string,
            user: string,
            group: string
        }>{},
        "data": <{
            user:string,
            role:number
        }>{},


    },
    teamPullProject: {
        "method": "PUT",
        "path": "/admin/teampullproject",
        "param": <{
            id: string,
            project: string,
            category: number
        }>{},
        "data": <IRes_Admin_TeamPullProject>{},


    },
    teamPushProject: {
        "method": "PUT",
        "path": "/admin/teampushproject",
        "param": <{
            id: string,
            project: string,
            category: number
        }>{},
        "data": {},


    },
    projectUserRole: {
        "method": "POST",
        "path": "/admin/projectuserrole",
        "param": <{
            id: string,
            user: string,
            role?: number,
            option?: string,
            category: number
        }>{},
        "data": {},


    },
    removeProjectUser: {
        "method": "DELETE",
        "path": "/admin/projectuser",
        "param": <{
            id: string,
            user: string,
            category: number
        }>{},
        "data": {},


    },
    projectUserList: {
        "method": "GET",
        "path": "/admin/projectuserlist",
        "param": <{
            id: string,
            category: number
        }>{},
        "data": <IRes_Admin_ProjectUserList>{},


    },
    searchUser: {
        "method": "GET",
        "path": "/admin/searchuser",
        "param": <{
            user: string
        }>{},
        "data": <ICommon_User[]>[],


    },
    teamProjectList: {
        "method": "GET",
        "path": "/admin/teamprojectlist",
        "param": <{
            id: string
        }>{},
        "data": <IRes_Admin_TeamProjectList_Project[]>[],


    },
    statisticList: {
        "method": "GET",
        "path": "/admin/statisticlist",
        "param": <{
            start: string,
            end: string
        }>{},
        "data": <ICommon_Statistic>{},


    },
    setting: {
        "method": "GET",
        "path": "/admin/setting",
        "param": <{}>{},
        "data": <{
            info:{
                version:string,
                register:number
            },
            connect:{
                db:string,
                filePath:string,
                port:number,
            },
            files:string[],
            db:any
        }>{},


    },
    editBasicInfo: {
        "method": "PUT",
        "path": "/admin/basicinfo",
        "param": <{
            register: number
        }>{},
        "data": <{
            version:string
            register:number
            dbName:{
                dbPath:string
                backPath:string
                hours:any[]
                host:string
                name:string
                user?:string
                pass?:string
                authDb?:string
            }
        }>{},


    },
    editConnectInfo: {
        "method": "PUT",
        "path": "/admin/connectinfo",
        "param": <{
            db: string,
            file: string,
            port: string
        }>{},
        "data": {},


    },
    backup: {
        "method": "PUT",
        "path": "/admin/backup",
        "param": <{
            dbpath: string,
            backpath: string,
            hours: string,
            host: string,
            name: string,
            user?: string,
            pass?: string,
            authdb?: string,
            immediate: number
        }>{},
        "data": {},


    },
    restore: {
        "method": "PUT",
        "path": "/admin/restore",
        "param": <{
            id: string
        }>{},
        "data": {},


    },
    backupList: {
        "method": "GET",
        "path": "/admin/backuplist",
        "param": <{
            page: number
        }>{},
        "data": <string[]>[],


    },
    removeBackup: {
        "method": "DELETE",
        "path": "/admin/backup",
        "param": <{
            id: string
        }>{},
        "data": {},


    },
}
export = api
