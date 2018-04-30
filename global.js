var GlobalRC;
var GlobalHosturl;
var log=[];
module.exports={
    RC: GlobalRC,
    hosturl: GlobalHosturl,
    log:function(message){
        log.push(message);
    }
}
