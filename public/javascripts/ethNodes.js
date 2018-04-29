var Patient=require('./objects').patient;
var pGateKeeper=require('./gateKeepers').PatientGatekeeper;

var Device=require('./objects').medicalDevice;
var dbGateKeeper=require('./gateKeepers').DbGatekeeper;

patientNode=function(id,name,hosturl,RC){
    
    this.patient=new Patient(id,name);
        
    this.gateKeeper;
    
    this.init=async function(){
        
        if(id!=undefined&&hosturl!=undefined&&RC!=undefined)
            {
                this.gateKeeper=new pGateKeeper(hosturl,id,RC);
                await this.gateKeeper.init();
            }
    }

    this.query=async function(deviceNode,ownerID,queryIndex){
        if(gateKeeper==undefined)
            {
                console.log('gate keeper is not initialized, please await init.');
                return;
            }
        var result=await this.gateKeeper.query(deviceNode.gateKeeper,ownerID,queryIndex);
        return result;
    }
}
deviceNode=function(_deviceId,_deviceName,hosturl,RC){
    this.device=new Device(_deviceId,_deviceName);
    this.gateKeeper;

    this.init=async function(){
        if(_deviceId!=undefined&&hosturl!=undefined&&RC!=undefined)
                {
                    this.gateKeeper=new dbGateKeeper(hosturl,_deviceId,RC);
                    await this.gateKeeper.init();
                }
    }

    this.handleQuery=async function(querorID,query_object,signed_query_object){
        
        if(this.gateKeeper==undefined)
            {
                console.log("dbGateKeeper is not initialized yet.");
                return;
            }

        var permit=await this.gateKeeper.handleQuery(querorID,query_object,signed_query_object);

        if(permit==true)
            return this.device.handleQuery(query_object.queryIndex);
        else{
            return "Error: permission denied";
        }
    }

    this.submitDataLog = function() {
        for (var i = this.submitCount; i < this.dataLog.length; i++) {
             // submit hash(this.dataLog[i]) to smart contract
        }
        this.submitCount = this.dataLog.length;
        return;
    };
    
}
module.exports.patientNode=patientNode;
module.exports.deviceNode=deviceNode;
