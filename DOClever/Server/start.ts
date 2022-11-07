#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app = require('./app');
import http = require('http');
import util=require("./util/util");
/**
 * Get port from environment and store in Express.
 */
util.event.on("init",function () {
    var config=require("../config.json")
    var addClient=require("./socket/doc")
    var port = config.port?config.port:10000
    var server = http.createServer(app.callback()).listen(port,function () {
        console.log(`listen on port:${port}`);
    });
    var io=require("socket.io")(server);
    io.on("connection",function (client) {
        addClient(client);
    })
})


