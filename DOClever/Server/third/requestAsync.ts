/**
 * Created by sunxin on 16/6/8.
 */
import request=require("request");
import blue=require("bluebird");
var requestAsync=blue.promisify(request);

export=requestAsync;