var GlobalRC;
var GlobalHosturl;
var log=['init'];


/*Crafting log event*/
const EventEmitter = require('events');

class LogEmitter extends EventEmitter {}

const logEmitter = new LogEmitter();

// myEmitter.emit('event');


module.exports={
    logListener:logEmitter,
    RC: GlobalRC,
    hosturl: GlobalHosturl,
    log:function(message){
        log.push(message);
        console.log(message);
        logEmitter.emit('log');
    },
    getLog:function(){
        return log;
    },
    flushLog:function(){
        log=[];
    }
}
