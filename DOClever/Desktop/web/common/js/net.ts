import config=require("./config");
import axios, {AxiosRequestConfig} from "axios"
import $=require("./common")
import {webSingle} from "../../../global";
import session=require("./local")
function getAllHeaders(obj) {
    var result={};
    for(var key in obj.map)
    {
        if(obj.map.hasOwnProperty(key))
        {
            result[key.toLowerCase()]=obj.map[key][0];
        }
    }
    return result;
}

function handleVersionHeaders(headers) {
    var header=headers || {};
    if(session.get("versionId"))
    {
        header["docleverversion"]=session.get("versionId");
    }
    if(session.get("snapshotId"))
    {
        header["docleversnapshot"]=session.get("snapshotId");
    }
    if(session.get("autosave"))
    {
        header["interfaceautosave"]=session.get("autosave");
    }
    return header;
}

function convertHeader(data) {
    if(data.length>0)
    {
        var obj={};
        var arr=data.split("\r\n");
        for(var i=0;i<arr.length;i++)
        {
            var index=arr[i].indexOf(":")
            if(index>-1)
            {
                obj[arr[i].substr(0,index)]=arr[i].substr(index+1);
            }
        }
        return obj;
    }
    else
    {
        return {};
    }
}
var net={
    get:function (path,params,headers,baseUrl?) {
        headers=handleVersionHeaders(headers);
        if(!params)
        {
            params={};
        }
        params.sbdoctimestamps=(new Date()).getTime()
        let query:AxiosRequestConfig={
            headers:headers,
            params:params,
            withCredentials:true,
            url:(baseUrl?baseUrl:config.baseUrl)+path,
            method:"get"
        }
        return axios(query).then(function (res) {
            var json=res.data;
            if(json.code==13)
            {
                location.href=webSingle.api.path.getLoginPath();
            }
            else if(json.code==35)
            {
                session.remove("versionId");
                session.remove("versionName");
                session.remove("versionDis");
                location.reload();
            }
            else
            {
                return json;
            }
        })
    },
    run:function(path,data,headers,baseUrl)
    {
        var bEncode=false,bFind=false;
        if(headers)
        {
            for(var key in headers)
            {
                if(key.toLowerCase()=="content-type")
                {
                    bFind=true;
                    if(headers[key].toLowerCase()=="application/x-www-form-urlencoded")
                    {
                        bEncode=true;
                        break;
                    }
                }
            }
        }
        if(data)
        {
            if(bEncode || !bFind)
            {
                data=$.param(data,1);
                if(!bFind)
                {
                    if(headers)
                    {
                        headers["content-type"]="application/x-www-form-urlencoded"
                    }
                    else
                    {
                        headers={
                            "content-type":"application/x-www-form-urlencoded"
                        }
                    }
                }
            }
        }
        else
        {
            data=""
        }
        return axios({
            headers:headers,
            withCredentials:true,
            method:"post",
            data:data,
            url:(baseUrl?baseUrl:config.baseUrl)+path
        }).then(function (res) {
            var json=res.data;
            var resObj;
            if(typeof (json)=="string")
            {
                var strStr=json;
                try
                {
                    resObj=JSON.parse(strStr);
                }
                catch (err)
                {
                    resObj=strStr;
                }
            }
            else
            {
                if(typeof (json)=="object" && (json instanceof Blob) && json.size<=1024*5)
                {
                    return new Promise(function (resolve,reject) {
                        var reader = new FileReader();
                        reader.onload = function(){
                            var content = reader.result;
                            if(/application\/xml/i.test(res.headers.map["content-type"][0]) || /text\/xml/i.test(res.headers.map["content-type"][0]))
                            {
                                resObj=content;
                            }
                            else
                            {
                                try
                                {
                                    resObj=JSON.parse(content as string);
                                }
                                catch (err)
                                {
                                    resObj=json;
                                }
                            }
                            var obj={
                                data:resObj,
                                status:res.status,
                                header:getAllHeaders(res.headers),
                            }
                            resolve(obj);
                        };
                        reader.onerror = function(event){
                            resObj=json;
                            var obj={
                                data:resObj,
                                status:res.status,
                                header:getAllHeaders(res.headers),
                            }
                            resolve(obj);
                        };
                        reader.readAsText(json);
                    })
                }
                else
                {
                    resObj=json;
                }
            }
            var obj={
                data:resObj,
                status:res.status,
                header:getAllHeaders(res.headers),
            }
            return obj;
        })
    },
    post:function (path,data,headers,baseUrl?) {
        headers=handleVersionHeaders(headers);
        var bEncode=false,bFind=false;
        if(headers)
        {
            for(var key in headers)
            {
                if(key.toLowerCase()=="content-type")
                {
                    bFind=true;
                    if(headers[key].toLowerCase()=="application/x-www-form-urlencoded")
                    {
                        bEncode=true;
                        break;
                    }
                }
            }
        }
        if(data)
        {
            if(bEncode || !bFind)
            {
                data=$.param(data,1);
                if(!bFind)
                {
                    if(headers)
                    {
                        headers["content-type"]="application/x-www-form-urlencoded"
                    }
                    else
                    {
                        headers={
                            "content-type":"application/x-www-form-urlencoded"
                        }
                    }
                }
            }
        }
        else
        {
            data=""
        }
        return axios({
            headers:headers,
            withCredentials:true,
            method:"post",
            data:data,
            url:(baseUrl?baseUrl:config.baseUrl)+path
        }).then(function (res) {
            var json=res.data;
            if(json.code==13)
            {
                location.href=webSingle.api.path.getLoginPath();
            }
            else if(json.code==35)
            {
                session.remove("versionId");
                session.remove("versionName");
                session.remove("versionDis");
                location.reload();
            }
            else
            {
                return json;
            }

        })
    },
    put:function (path,data,headers,baseUrl?) {
        headers = handleVersionHeaders(headers);
        var bEncode = false, bFind = false;
        if (headers) {
            for (var key in headers) {
                if (key.toLowerCase() == "content-type") {
                    bFind = true;
                    if (headers[key].toLowerCase() == "application/x-www-form-urlencoded") {
                        bEncode = true;
                        break;
                    }
                }
            }
        }
        if (data) {
            if (bEncode || !bFind) {
                data = $.param(data, 1);
                if (!bFind) {
                    if (headers) {
                        headers["content-type"] = "application/x-www-form-urlencoded"
                    } else {
                        headers = {
                            "content-type": "application/x-www-form-urlencoded"
                        }
                    }
                }
            }
        } else {
            data = ""
        }
        return axios({
            headers: headers,
            withCredentials: true,
            method: "put",
            data: data,
            url: (baseUrl?baseUrl:config.baseUrl)+path
        }).then(function (res) {
            var json = res.data;
            if (json.code == 13) {
                location.href=webSingle.api.path.getLoginPath();
            }else if(json.code==35)
            {
                session.remove("versionId");
                session.remove("versionName");
                session.remove("versionDis");
                location.reload();
            } else {
                return json;
            }
        })
    },
    delete:function (path,params,headers,baseUrl?) {
        headers=handleVersionHeaders(headers);
        return axios({
            headers:headers,
            params:params,
            withCredentials:true,
            method:"delete",
            url:(baseUrl?baseUrl:config.baseUrl)+path
        }).then(function (res) {
            var json=res.data;
            if(json.code==13)
            {
                location.href=webSingle.api.path.getLoginPath();
            }else if(json.code==35)
            {
                session.remove("versionId");
                session.remove("versionName");
                session.remove("versionDis");
                location.reload();
            }
            else
            {
                return json;
            }
        })
    },
    uploadRun:function (method,path,data,headers,baseUrl,bNet?) {
        var form;
        if (typeof (data) == "string" || (data instanceof ArrayBuffer)) {
            form = data;
            if (headers) {
                var bFind = false;
                for (var key in headers) {
                    if (key.toLowerCase() == "content-type") {
                        bFind = true;
                        break;
                    }
                }
                if (!bFind) {
                    if (typeof (data) == "string") {
                        var bJson = true;
                        try {
                            JSON.parse(data);
                        } catch (e) {
                            bJson = false;
                        }
                        if (bJson) {
                            headers["content-type"] = "application/json"
                        } else {
                            headers["content-type"] = "text/plain";
                        }
                    } else {
                        headers["content-type"] = "application/x-www-form-urlencoded"
                    }
                }
            } else {
                if (typeof (data) == "string") {
                    var bJson = true;
                    try {
                        JSON.parse(data);
                    } catch (e) {
                        bJson = false;
                    }
                    if (bJson) {
                        headers = {
                            "content-type": "application/json"
                        }
                    } else {
                        headers = {
                            "content-type": "text/plain"
                        }
                    }
                } else {
                    headers = {
                        "content-type": "application/x-www-form-urlencoded"
                    }
                }
            }
        } else {
            form = new FormData();
            for (var key in data) {
                form.append(key, data[key]);
            }
        }
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            xhr.open(method, bNet ? path : ((baseUrl ? baseUrl : config.baseUrl) + path), true);
            if (headers) {
                for (var key in headers) {
                    xhr.setRequestHeader(key, headers[key]);
                }
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    var resObj;
                    if (xhr.responseType == "text" || xhr.responseType == "" || xhr.responseType == "json") {
                        var strStr = xhr.responseText;
                        try {
                            resObj = JSON.parse(strStr);
                        } catch (err) {
                            resObj = strStr;
                        }
                    } else {
                        if ((xhr.responseType == "blob" || xhr.responseType == "arraybuffer" || xhr.responseType == "document") && xhr.response.size <= 1024 * 5) {
                            var reader = new FileReader();
                            reader.onload = function () {
                                var content = reader.result;
                                if (/application\/xml/i.test(xhr.getResponseHeader("content-type")) || /text\/xml/i.test(xhr.getResponseHeader("content-type"))) {
                                    resObj = content;
                                } else {
                                    try {
                                        resObj = JSON.parse(content as string);
                                    } catch (err) {
                                        resObj = xhr.response;
                                    }
                                }
                                var obj = {
                                    data: resObj,
                                    status: xhr.status,
                                    header: convertHeader(xhr.getAllResponseHeaders()),
                                }
                                resolve(obj);
                            };
                            reader.onerror = function (event) {
                                resObj = xhr.response;
                                var obj = {
                                    data: resObj,
                                    status: xhr.status,
                                    header: convertHeader(xhr.getAllResponseHeaders()),
                                }
                                resolve(obj);
                            };
                            reader.readAsText(xhr.response);
                            return;
                        } else {
                            resObj = xhr.response;
                        }
                    }
                    var obj = {
                        data: resObj,
                        status: xhr.status,
                        header: convertHeader(xhr.getAllResponseHeaders()),
                    }
                    resolve(obj)
                    return;
                }
            }
            xhr.send(form);
        })
    },
    upload:function (method,path,data,headers,baseUrl?) {
        headers = handleVersionHeaders(headers);
        var form;
        if (typeof (data) == "string" || (data instanceof ArrayBuffer)) {
            form = data;
            if (headers) {
                var bFind = false;
                for (var key in headers) {
                    if (key.toLowerCase() == "content-type") {
                        bFind = true;
                        break;
                    }
                }
                if (!bFind) {
                    if (typeof (data) == "string") {
                        var bJson = true;
                        try {
                            JSON.parse(data);
                        } catch (e) {
                            bJson = false;
                        }
                        if (bJson) {
                            headers["content-type"] = "application/json"
                        } else {
                            headers["content-type"] = "text/plain";
                        }
                    } else {
                        headers["content-type"] = "application/x-www-form-urlencoded"
                    }
                }
            } else {
                if (typeof (data) == "string") {
                    var bJson = true;
                    try {
                        JSON.parse(data);
                    } catch (e) {
                        bJson = false;
                    }
                    if (bJson) {
                        headers = {
                            "content-type": "application/json"
                        }
                    } else {
                        headers = {
                            "content-type": "text/plain"
                        }
                    }
                } else {
                    headers = {
                        "content-type": "application/x-www-form-urlencoded"
                    }
                }
            }
        } else {
            form = new FormData();
            for (var key in data) {
                form.append(key, data[key]);
            }
        }
        var request;
        if (method.toLowerCase() == "post") {
            request = axios.post;
        } else if (method.toLowerCase() == "put") {
            request = axios.put;
        } else if (method.toLowerCase() == "patch") {
            request = axios.patch;
        }
        return request((baseUrl ? baseUrl : config.baseUrl) + path, form, {
            headers: headers,
            withCredentials: true
        }).then(function (res) {
            var json = res.body;
            if (json.code == 13) {
                location.href = webSingle.api.path.getLoginPath();
            } else if (json.code == 35) {
                session.remove("versionId");
                session.remove("versionName");
                session.remove("versionDis");
                location.reload();
            } else {
                return json;
            }
        })
    }
};




export=net;
