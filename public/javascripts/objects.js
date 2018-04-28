/*The contractDeployer deploys MedRec contracts on sender's demand, 
to a specific deployment url, using a specific address.*/

/*User needs to specify which contract to deploy, and pass in the 
parameters used in the constructor of contracts.*/
var utils=require('../../bkc_utils');
DbGatekeeper=function(hosturl,RC,providerId){
    var web3=require('../../bkc_utils').quickWeb3(hosturl);
    var deployer=new utils.contractDeployer(hosturl);
    this.RC=RC;   
    this.PPR_List=[];
    this.keeperAccount;
    this.keeperPersonal;
    this.hosturl=hosturl;
    this.providerId=providerId;

    this.init=async function(){
        var utils=require('../../bkc_utils');
        var result=await utils.quickAccount(hosturl);    
        this.keeperAccount=result.account;
        this.keeperPersonal=result.personal;
    }
    this.init();

    this.getPatientProfile=async function(patientID){
        //go to RC and retrieve the profile.
    
        var paddress=await RC.methods.getEthAddr(patientID).call({from:this.keeperPersonal,gasPrice:'0'});
        var scaddress=await RC.methods.getSCAddr(patientID).call({from:this.keeperPersonal,gasPrice:'0'});
        
        var SC=deployer.Contract_at("SC",scaddress);
        
        return {patientAddress:paddress,SC:SC};
    }
    
    this.verifyIdentity=function(signed_query_object,ethAddress){
        
        var recover=web3.eth.accounts.recover(signed_query_object);

        if(recover==ethAddress)
            return true;
        else{
            
            console.log("!!!!Signature verfication fails!!!! recover address:",recover,"actual address:",ethAddress);
            return false;
        }
    }

    this.verifyPermission=async function(querorID,query){
        
        var owner=await this.getPatientProfile(query.ownerID);
        
        var SC=owner.SC;
        
        
        var pprAddr=await SC.methods.getPPRAddress(this.providerId).call({from:this.keeperPersonal,gasPrice:'0'});
        
        var status=await SC.methods.getStatus(pprAddr).call({from:this.keeperPersonal,gasPrice:'0'});
        if(status==0)
            {
                console.log("Provider"+this.providerId+" is not serving "+query.ownerID);
                return false;
            }
        
        var PPR=deployer.Contract_at('PPR',pprAddr);
        var permission=await PPR.methods.getPermission(query.query).call({from:this.keeperPersonal,gasPrice:'0'});
    
        if(permission==1)
           {
               console.log("This is a public data.");
                return true;//i.e., the record is public, the permission is granted.
           }
        else if(permission==0)
            {   console.log("This is a piece of private data");
                return querorID==query.ownerID;
            } //i.e., the record is private, the permission is only granted to owner herself.
        
        return false;

    }

    this.handleQuery=function(querorID,query,signed_query_object){
        var profile=this.getPatientProfile(patientID);
        var verify=this.verifyIdentity(signed_query_object,profile.ethAccount);
        
        if(verify==false)
            {
                console.log("Queror ID does not match signature.");
                return null;
            }
        verify=this.verifyPermission(querorID,query);

        if(verify==false)
        {
            console.log("Patient does not have the permission with this query.");
            return null;
        }
        
    }  
        
}

function medicalDevice(id, name) {
    this.deviceID = id;
    this.deviceName = name;
    this.dataLog = []; // offchain database
    this.submitCount = 0;
    this.generateData = function(newData,publicKey=null) {
        
        var data={time:new Date(), content: newData};
        
        if(publicKey==null)
            dataLog.push(data);
        else
            dataLog.push(this.encrypt(publicKey,data));
        
            return;
    };
    this.submitDataLog = function() {
        for (var i = this.submitCount; i < this.dataLog.length; i++) {
             // submit hash(this.dataLog[i]) to smart contract
        }
        this.submitCount = this.dataLog.length;
        return;
    };
    this.handleQuery = function(count, publicKey) {
        var result;
        if (count < this.submitCount) {
            result = this.dataLog.slice(this.submitCount - count, this.submitCount); // newest records
        } else {
            result = this.dataLog.slice(0, this.submitCount);
        }
        return result;
    };
    this.encrypt = function(publicKey, data) {
        var cryptico=require('cryptico');
        data=cryptico.encrypt(data.toString(),publicKey.toString()).cipher;
        return data; // plain text, no encryption
    };
}


// Constructor function for patient objects
function patient(id, name) {
    
    this.patientID = id;
    this.patientName = name;
    this.deviceList = []; // need register device to patient ?
    this.privateKey = null;
    this.publicKey = null;
    this.emKey=null;    
    
    this.generateEmKey = function() {
        // generate emergency key

            var SHA256=require("crypto-js").SHA256;

            var nounce=Math.floor(Math.random()*Math.pow(2,20));
            return SHA256(this.patientID+nounce);                        
    }

    this.emKey=this.generateEmKey();
     
    this.encryptEm = function(message){
        var AES=require("crypto-js").AES;

        return AES.encrypt(""+message,""+this.emKey).toString();
    }

    this.decryptEm = function(message){
         var CryptoJS=require("crypto-js");
         var bytes=CryptoJS.AES.decrypt(message.toString(),""+this.emKey);
        if(bytes=="")
            return 'Decryption Fails';

        return bytes.toString(CryptoJS.enc.Utf8); 
    }

    const KEYLENGTH=512;
    this.getKeyLength=function(){return KEYLENGTH;}

    this.generateKeyPair = function() {
        // generate private key and public key

        var nounce=Math.floor(Math.random()*Math.pow(2,20));

        var cryptico=require('cryptico');

        var rsaKeyObj=cryptico.generateRSAKey(nounce+"",this.getKeyLength());
        this.publicKey=cryptico.publicKeyString(rsaKeyObj);
        this.privateKey=rsaKeyObj;

        return;
    }

    this.query = function(device) {
        return device.handleQuery(10, this.publicKey);
        // should it check the smart contract first ?
    };
    this.decrypt = function(privateKey, cipher) {

        var cryptico=require('cryptico');
        var decryption = cryptico.decrypt(cipher,privateKey);
        return decryption.plaintext; // plain text, no decryption
    };
}

exports.patient=patient;
exports.medicalDevice=medicalDevice;

exports.DbGatekeeper=DbGatekeeper;