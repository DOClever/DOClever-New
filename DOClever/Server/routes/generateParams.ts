import {IInterface_structure} from "../types/global";
import {keys} from "../../Common/transform/index";

var objRoute:{
    [param:string]:IInterface_structure[]
}={

}

export function api(objParam:Omit<IInterface_structure,"handle"|"user"|"admin">,params:any[]) {
    return function (target,key:string,desc:PropertyDescriptor) {
        let name=target.constructor.name.toLocaleLowerCase()
        let obj=objRoute[name]
        if(!obj)
        {
            objRoute[name]=[]
            obj=objRoute[name]
        }
        let handle
        handle=desc.value
        let temp={
            ...<any>objParam,
            handle:handle
        }
        let objP:any={}
        params.forEach(function (obj) {
            if(obj.optional)
            {
                objP[obj.name]={
                    optional:1,
                    type:obj.type=="string"?String:Number
                }
            }
            else
            {
                objP[obj.name]=obj.type=="string"?String:Number
            }
        })
        temp.param=objP
        obj.push(temp)
    }
}

export function user(target,key:string,desc:PropertyDescriptor) {
    let name=target.constructor.name.toLocaleLowerCase()
    let obj=objRoute[name]
    if(!obj)
    {
        objRoute[name]=[]
        obj=objRoute[name]
    }
    for(let o of obj)
    {
        if(o.handle==desc.value || (o.handle instanceof Array && o.handle.includes(desc.value)))
        {
            o.user=1
        }
    }
}

export function admin(target,key:string,desc:PropertyDescriptor) {
    let name=target.constructor.name.toLocaleLowerCase()
    let obj=objRoute[name]
    if(!obj)
    {
        objRoute[name]=[]
        obj=objRoute[name]
    }
    for(let o of obj)
    {
        if(o.handle==desc.value || (o.handle instanceof Array && o.handle.includes(desc.value)))
        {
            o.admin=1
        }
    }
}

export function getRouteApi(category:string):IInterface_structure[] {
    let obj=objRoute[category]
    if(obj)
    {
        return obj
    }
    else
    {
        return []
    }
}
