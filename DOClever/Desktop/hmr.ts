import {nodeSingle} from "./global";

var path=require("path");
var webpack = require('webpack'), WebpackDevServer = require("webpack-dev-server");
const webpackDevConfig = require('./dev');
var compiler = webpack(webpackDevConfig);
var server = new WebpackDevServer(compiler, {
    hot:true,
    filename: webpackDevConfig.output.filename,
    publicPath: webpackDevConfig.output.publicPath,
    stats: {
        colors: true
    },
    historyApiFallback: true,
    inline:true
});
server.listen(8081,"0.0.0.0",function (err) {
    if(err)
    {
        console.log(err);
    }
})
nodeSingle.debug=true;
