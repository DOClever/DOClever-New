/**
 * Created by sunxin on 2017/2/16.
 */
import {webSingle} from "../../../global";

(<any>window).Vue.use({
    install (Vue, options) {
        Vue.prototype.$remote=webSingle.remote
        Vue.prototype.$apiLogin = webSingle.api;
    }
});
document.body.ondrop = function (event) {
    event.preventDefault();
    event.stopPropagation();
}
var hud=null;
var $={
    err:function (msg) {
        if(typeof(msg)=="object")
        {
            $.tip(msg.message,0);
            console.log(msg.message)
        }
        else
        {
            $.tip(msg,0);
            console.log(msg)
        }
    },
    ready : function (callback) {
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', function () {
                // @ts-ignore
                document.removeEventListener('DOMContentLoaded', arguments.callee, false);
                callback();
            }, false)
        }
        // @ts-ignore
        else if (document.attachEvent) {
            // @ts-ignore
            document.attachEvent('onreadystatechange', function () {
                if (document.readyState == "complete") {
                    // @ts-ignore
                    document.detachEvent("onreadystatechange", arguments.callee);
                    callback();
                }
            })
        }
        else if (document.lastChild == document.body) {
            callback();
        }
    },

    trim:function (str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    },

    clone:function(o){
        var k, ret= o, b;
        if(o && ((b = (o instanceof Array)) || o instanceof Object)) {
            ret = b ? [] : {};
            for(k in o){
                if(o.hasOwnProperty(k)){
                    ret[k] = arguments.callee(o[k]);
                }
            }
        }
        return ret;
    },

    addClass:function (ele,name) {
        if(ele.className=="")
        {
            ele.className=name;
        }
        else
        {
            ele.className+=" "+name;
        }
    },

    removeClass:function (ele,name) {
        var reg=new RegExp(name+"|\\s+"+name+"|"+name+"\\s+","gi")
        ele.className=ele.className.replace(reg,"");
    },

    addEventListener:function (ele,ev,fn) {
        var arr=ev.split(" ");
        arr.forEach(function (obj) {
            if(ele.attachEvent)
            {
                ele.attachEvent("on" + obj,fn);
            }
            else
            {
                ele.addEventListener(obj,fn,false);
            }
        })
    },

    removeEventListener:function (ele,ev,fn) {
        var arr=ev.split(" ");
        arr.forEach(function (obj) {
            if(ele.detachEvent)
            {
                ele.detachEvent("on" + obj,fn);
            }
            else
            {
                ele.removeEventListener(obj,fn);
            }
        })

    },

    once:function (ele,ev,fn) {
        $.addEventListener(ele,ev,function () {
            fn.apply(this,arguments);
            $.removeEventListener(ele,ev,arguments.callee);
        })
    },

    startLoading:function (scope) {
        var arr=["不忘初心，方得始终","愿每一个程序员有情人终成眷属","嘿咻嘿咻拼命加载中！"];
        if(document.getElementById("SBDocStartLoading"))
        {
            return;
        }
        var ele=document.createElement("div");
        ele.id="SBDocStartLoading";
        ele.style.position="absolute";
        ele.style.zIndex=String(10000);
        ele.style.backgroundColor="white";
        var ele1;
        if(scope==1)
        {
            ele1=document.getElementById("showContent");
            ele.style.left="100px";
            ele.style.top="60px";
            ele.style.width="calc(100vw - 100px)";
            ele.style.height="calc(100vh - 60px)";
        }
        else if(scope==2)
        {
            ele1=document.getElementById("interfaceContent");
            var rect=ele1.getBoundingClientRect();
            ele.style.left=rect.left+"px";
            ele.style.top=rect.top+40+"px";
            ele.style.width=rect.width+"px";
            ele.style.height="calc(100vh - 155px)";
        }
        else if(scope==3)
        {
            ele1=document.getElementById("testInfoContent");
            var rect=ele1.getBoundingClientRect();
            ele.style.left=rect.left+"px";
            ele.style.top=rect.top+40+"px";
            ele.style.width=rect.width+"px";
            ele.style.height="calc(100vh - 155px)";
        }
        else
        {
            ele.style.left="0px";
            ele.style.top="0px";
            ele.style.width="100%";
            ele.style.height=document.documentElement.clientHeight+"px";
            ele.style.backgroundColor="rgb(45,45,45)"
        }
        ele.innerHTML='<div style="text-align: center;margin-top: '+(document.documentElement.clientHeight/2-100)+'px"><div class="fa fa-spinner fa-spin" style="color: #50bfff;font-size: 30px;"></div><div style="margin-top: 30px;color: gray;font-size: 15px">'+(ele1?arr[parseInt(String(Math.random()*arr.length))]:"DOClever,做最好的接口管理平台")+'</div></div>'
        document.body.appendChild(ele);
    },

    stopLoading:function () {
        setTimeout(function () {
            var ele=document.getElementById("SBDocStartLoading");
            if(ele)
            {
                $.addClass(ele,"animated fadeOut");
                $.once(ele,"webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function () {
                    var ele=document.getElementById("SBDocStartLoading");
                    if(ele)
                    {
                        ele.parentNode.removeChild(ele);
                    }
                })
            }
        },100);
    },

    animate:function (ele,style) {
        if(ele)
        {
            style="animated "+style;
            $.addClass(ele,style);
            $.once(ele,"webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function () {
                $.removeClass(ele,style);
            })
        }
    },

    query:function (str,ele) {
        if(ele)
        {
            return ele.querySelector(str);
        }
        else
        {
            return document.querySelector(str);
        }
    },

    queryAll:function (str,ele) {
        if(ele)
        {
            return ele.querySelectorAll(str);
        }
        else
        {
            return document.querySelectorAll(str);
        }
    },

    confirm:function (title,funcOk,funcCancel) {
        return new Promise(function (resolve,reject) {

        })
    },

    tip:function (content,bOk) {
        if(bOk==1)
        {

        }
        else if(bOk==0)
        {

        }
        else if(bOk==2)
        {

        }
        else if(bOk==3)
        {

        }
    },

    loading:function (content) {
        return $.tip(content,3);
    },

    notify:function (content,bOk) {
        if(bOk)
        {

        }
        else
        {

        }
    },

    input:function (title,func,defaultValue) {

    },



    inputMul:function (vue,placeholder,func,hudRemove,content) {

    },

    inputTwo:function (vue,labelTitle,labelContent,placeholderTitle,placeholderContent,textTitle,textContent,func,hudRemove) {

    },


startHud:function (ele) {
    if(ele)
    {

    }
    else
    {

    }
},

stopHud:function () {
    if(hud)
    {

    }
},

getNowFormatDate:function(fmt,date) {
    var date=date || new Date();
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
},

showBox:function (vue,obj,attr) {

},

param:function (obj,bKey) {
    var arr=[];
    for(var key in obj)
    {
        arr.push((bKey?encodeURIComponent(key):key)+"="+encodeURIComponent(obj[key]));
    }
    return arr.join("&");
},

inArr:function (str,arr) {
    for(var i=0;i<arr.length;i++)
    {
        if(str.toLowerCase()==arr[i].toLowerCase())
        {
            return true;
        }
    }
    return false;
},

parseURL:function(url) {
    var a = document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.replace(/^\?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^\//,'').split('/')
    };
},

createUrlObject:function(obj) {
    // @ts-ignore
    if (window.createObjectURL != undefined) { // basic
        // @ts-ignore
        return window.createObjectURL(obj);
    }  else if (window.URL != undefined) { // mozilla(firefox)
        return window.URL.createObjectURL(obj);
    } else if (window.webkitURL != undefined) { // webkit or chrome
        return window.webkitURL.createObjectURL(obj);
    }
},

revokeUrlObject:function(obj) {
    // @ts-ignore
    if (window.createObjectURL != undefined) { // basic
        // @ts-ignore
        return window.revokeObjectURL(obj);
    }  else if (window.URL != undefined) { // mozilla(firefox)
        return window.URL.revokeObjectURL(obj);
    } else if (window.webkitURL != undefined) { // webkit or chrome
        return window.webkitURL.revokeObjectURL(obj);
    }
},

basePath:function () {
    var path=location.href;
    var index=path.indexOf("/controller/");
    return path.substring(0,index+"/controller/".length)
},

rand:function (Min,Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}

};

export=$;













