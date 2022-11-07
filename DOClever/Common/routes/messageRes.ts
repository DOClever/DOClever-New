import {ICommon_Apply, ICommon_Message} from "./types";

export interface IRes_Message_List_Item extends Omit<ICommon_Message, "user"> {
    user:{
        _id:string,
        name:string,
        photo:string
    }
}
export type IRes_Message_List=IRes_Message_List_Item[]

export interface IRes_Message_ApplyList_TeamPullUser extends Omit<ICommon_Apply, "from"|"creator"|"editor">{
    fromType:"Team",
    from:{
        _id:string,
        name:string
    },
    to:string,
    toType:"User",
    type:0,
    state:0,
    creator:{
        _id:string,
        name:string,
        photo:string
    }
    editor:string
}

export interface IRes_Message_ApplyList_TeamPullProject extends Omit<ICommon_Apply, "from"|"to"|"creator"|"editor">{
    fromType:"Team",
    from:{
        _id:string,
        name:string
    },
    to:{
        _id:string,
        name:string
    },
    toType:"Project",
    type:1|4|6,
    state:0,
    creator:{
        _id:string,
        name:string,
        photo:string
    }
    editor:string
}

export interface IRes_Message_ApplyList_UserApplyTeam extends Omit<ICommon_Apply, "from"|"to"|"creator"|"editor">{
    fromType:"User",
    from:{
        _id:string,
        name:string
    },
    to:{
        _id:string,
        name:string
    },
    toType:"Team",
    type:2|3|5|7,
    state:0,
    creator:{
        _id:string,
        name:string,
        photo:string
    }
    editor:string
}

export interface IRes_Message_ApplyList_ProjectApplyTeam extends Omit<ICommon_Apply, "from"|"to"|"creator"|"editor">{
    fromType:"Project",
    from:{
        _id:string,
        name:string
    },
    to:{
        _id:string,
        name:string
    },
    toType:"Team",
    type:2|3|5|7,
    state:0,
    creator:{
        _id:string,
        name:string,
        photo:string
    }
    editor:string
}

export interface IRes_Message_ApplyList {
    teamPullUser:IRes_Message_ApplyList_TeamPullUser[],
    teamPullProject:IRes_Message_ApplyList_TeamPullProject[],
    userApplyTeam:IRes_Message_ApplyList_UserApplyTeam[],
    projectApplyTeam:IRes_Message_ApplyList_ProjectApplyTeam[]
}
