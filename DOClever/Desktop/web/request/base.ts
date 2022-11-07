import net=require("../common/js/net");
interface ICommon_Interface {
    "method": string,
    "path": string,
    "param": any,
    "data": any,
}
function generate<T extends ICommon_Interface,F={
    code:number,
    msg?:string,
    data?:T["data"]
}>(inter:T)
{
    let func:typeof net.get|typeof net.post|typeof net.put|typeof net.delete
    if(inter["method"]=="GET")
    {
        func=net.get
    }
    else if(inter["method"]=="POST")
    {
        func=net.post
    }
    else if(inter["method"]=="PUT")
    {
        func=net.put
    }
    else if(inter["method"]=="DELETE")
    {
        func=net.delete
    }
    return async function (param:T["param"],headers?:any,showNotify?:boolean,showPending?:boolean):Promise<F> {
        if(showPending)
        {

        }
        let obj=await func(inter["path"],param,headers)
        if(showPending)
        {

        }
        if(obj.code==200)
        {
            if(showNotify)
            {

            }
        }
        else
        {
            if(showNotify)
            {

            }
        }
        return obj
    }
}
export =generate
