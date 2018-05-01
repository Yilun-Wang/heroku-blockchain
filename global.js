var GlobalRC;
var GlobalHosturl;
var log=['init'];
module.exports={
    RC: GlobalRC,
    hosturl: GlobalHosturl,
    log:function(message){
        log.push(message);
        console.log(message);
    },
    getLog:function(){
        return log;
    },
    flushLog:function(){
        log=[];
    }
}
