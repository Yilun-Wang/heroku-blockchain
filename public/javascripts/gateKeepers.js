
var utils=require('../../bkc_utils');

/*Gate keeper listens on internet and blockchain events, handles data query and new data sync on blockchain, on behalf of
MedDevice. It is the internet and blockchain proxy of MedDevice.*/
DbGatekeeper=function(hosturl,providerId,RC){
    var web3=require('../../bkc_utils').quickWeb3(hosturl);
    var deployer=new utils.contractDeployer(hosturl);
    this.RC=RC;   
    this.PPR_List=[];
    this.keeperAccount;
    this.keeperPersonal;
    this.hosturl=hosturl;
    this.providerId=providerId;
    this.initialized=false;
    

    this.init=async function(){
        var utils=require('../../bkc_utils');
        var result=await utils.quickAccount(hosturl);    
        this.keeperAccount=result.account;
        this.keeperPersonal=result.personal;
        this.initialized=true;
        
    }
    

    this.getPatientProfile=async function(patientID){
        //go to RC and retrieve the profile.
        if(!this.initialized)
            {
                console.log("Keeper not initialized, please await init() first");
                return;}

        var paddress=await RC.methods.getEthAddr(patientID).call({from:this.keeperPersonal,gasPrice:'0'});
        
        var scaddress=await RC.methods.getSCAddr(patientID).call({from:this.keeperPersonal,gasPrice:'0'});
        
        var SC=deployer.Contract_at("SC",scaddress);
        
        return {patientAddress:paddress,SC:SC};
    }
    
    this.verifyIdentity=function(query_object,signed_query_object,ethAddress){
        
        var recover=web3.eth.accounts.recover(utils.prefixhash(query_object),signed_query_object);

        if(recover==ethAddress)
            return true;
        else{
            
            console.log("!!!!Signature verfication fails!!!! recover address:",recover,"actual address:",ethAddress);
            return false;
        }
    }

    this.verifyPermission=async function(querorID,queryObject){
        if(!this.initialized)
            {
                console.log("Keeper not initialized, please await init() first");
                return;}

        var owner=await this.getPatientProfile(queryObject.ownerID);
        
        var SC=owner.SC;
        
        
        var pprAddr=await SC.methods.getPPRAddress(this.providerId).call({from:this.keeperPersonal,gasPrice:'0'});
        
        var status=await SC.methods.getStatus(pprAddr).call({from:this.keeperPersonal,gasPrice:'0'});
        if(status==0)
            {
                console.log("Provider '"+this.providerId+"' is not serving "+queryObject.ownerID);
                return false;
            }
        
        var PPR=deployer.Contract_at('PPR',pprAddr);
        var permission=await PPR.methods.getPermission(queryObject.queryIndex).call({from:this.keeperPersonal,gasPrice:'0'});
    
        if(permission==1)
           {
               console.log("This is a public data.");
                return true;//i.e., the record is public, the permission is granted.
           }
        else if(permission==0)
            {   console.log("This is a piece of private data");
                return querorID==queryObject.ownerID;
            } //i.e., the record is private, the permission is only granted to owner herself.
        
        return false;
    }

    
    /*query: it is an object {ownerID,queryIndex}, asking for the queryIndex'th piece
    of data from ownerID's data storage. */
    this.handleQuery=async function(querorID,query_object,signed_query_object){
        if(!this.initialized)
            {
                console.log("Keeper not initialized, please await init() first");
                return;
            }

        
        var profile=await this.getPatientProfile(querorID);
        var verify=this.verifyIdentity(query_object,signed_query_object,profile.patientAddress);
        
        if(verify==false)
            {
                console.log("Queror ID does not match signature.");
                return false;
            }
        verify=await this.verifyPermission(querorID,query_object);

        if(verify==false)
        {
            console.log("Patient does not have the permission with this query.");
            return false;
        }
        console.log("Permission confirmed.");
        return true;
    }  
    this.submitDataHash=async function(patientID,dataIndex,data){
        
        var hash=web3.utils.sha3(data);
        
        var patient=await this.getPatientProfile(patientID);
        
        var SC=patient.SC;
        
        var pprAddr=await SC.methods.getPPRAddress(this.providerId).call({from:this.keeperPersonal,gasPrice:'0'});
        
        var status=await SC.methods.getStatus(pprAddr).call({from:this.keeperPersonal,gasPrice:'0'});
        var PPR;
        if(status==0)
            {
                /*The PPR does not exists yet, create a new one. */
                console.log("Creating new PPR for provider '"+this.providerId+"' and patient '"+patientID+"'");
                deployer=new utils.contractDeployer(hosturl,this.keeperPersonal);
                PPR=await deployer.PPR_deploy(patientID,this.providerId);
                
                /*Also update SC*/
                await SC.methods.addPPR(this.providerId,PPR.options.address).send({from:this.keeperPersonal,gasPrice:'0'});
            }else{
                /*The PPR exists already. */
                PPR=deployer.Contract_at('PPR',pprAddr);
            }
        
        /*Permission set to private(=0) by default. */
        await PPR.methods.updatePermission(dataIndex,0).send({from:this.keeperPersonal,gasPrice:'0'});
        await PPR.methods.updateDataHash(dataIndex,hash).send({from:this.keeperPersonal,gasPrice:'0'});
        

    }        
}


/*Helper function, create a formatted query object.*/
function queryObject(_ownerID,_queryIndex){
    return {ownerID:_ownerID,queryIndex:_queryIndex};    
}


/*Patient keeper issues data query on behalf of patient. It handles query object
preparation, signature. It listens on blockchain events, and deal with them.*/
PatientGatekeeper=function(hosturl,patientID,RC){
    var web3=require('../../bkc_utils').quickWeb3(hosturl);
    
    // this.RC=RC;   
    this.PPR_List=[];
    this.keeperAccount;
    this.keeperPersonal;
    this.hosturl=hosturl;
    this.patientID=patientID;
    this.initialized=false;
    this.SC;
    
    this.init=async function(){
        //Create account for the patient
        var utils=require('../../bkc_utils');
        var result=await utils.quickAccount(hosturl);    
        this.keeperAccount=result.account;
        this.keeperPersonal=result.personal;
        this.initialized=true;    
        
        //Deploy an SC, update on RC.
        var deployer=new utils.contractDeployer(hosturl,this.keeperPersonal);

        this.SC=await deployer.SC_deploy(this.patientID,this.keeperPersonal);
        
        await RC.methods.registerEthAddr(this.patientID,this.keeperPersonal).send({from:this.keeperPersonal,gasPrice:'0'});
        await RC.methods.registerSCAddr(this.patientID,this.SC.options.address).send({from:this.keeperPersonal,gasPrice:'0'});
    }
    

    this.query=async function(dbGateKeeper,ownerID,queryIndex){
        if(!this.initialized)
            {
                console.log("Keeper not initialized, please await init() first");
                return;
            }
        /*Prepare query object*/
        var query=queryObject(ownerID,queryIndex);
        /*Prepare signature*/
        var signature=await web3.eth.sign(utils.prefixhash(query),this.keeperPersonal);
        /*Communicate with dbKeeper*/
        if(dbGateKeeper==undefined)
            {
                console.log("db Gate keeper is not defined.");
                return;
            }
        else{
            
        /*Get query result */
            var result=await dbGateKeeper.handleQuery(this.patientID,query,signature);
            return result;
        }
    }
}
module.exports.DbGatekeeper=DbGatekeeper;
module.exports.PatientGatekeeper=PatientGatekeeper;