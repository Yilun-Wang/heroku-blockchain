/*The contractDeployer deploys MedRec contracts on sender's demand, 
to a specific deployment url, using a specific address.*/

/*User needs to specify which contract to deploy, and pass in the 
parameters used in the constructor of contracts.*/

function contractDeployer(_url_toDeploy,_senderAddr){
    
    this.url_toDeploy=_url_toDeploy;
    this.senderAddr=_senderAddr;
    
    if(this.url_toDeploy==undefined)
        url_toDeploy="http:\\localhost:8545";

   
   this.RC_deploy=function(){
       console.log("Deploying an RC");
       return this.deploy_template("RC");
}
    this.PPR_deploy=function(patientID,providerID){
        console.log("Deploying an PPR");
    return this.deploy_template("PPR",patientID.toString(),providerID.toString());
}
    this.SC_deploy=function(RegistrarID,RegistrarEthAddr){
        console.log("Deploying an SC");
    return this.deploy_template("SC",RegistrarID.toString(),RegistrarEthAddr);
}

    this.deploy_template=function(sc_type,param1,param2){
        
        var Web3=require('web3');
        var web3=new Web3(new Web3.providers.HttpProvider(this.url_toDeploy));
  
        var format_src;
        switch(sc_type){
            case "RC": format_src='../../build/contracts/RC.json'; break;
            case "PPR": format_src='../../build/contracts/PPR.json'; break;
            case "SC": format_src='../../build/contracts/SC.json'; break;
            default: console.log('Unknown contract type.'); return undefined;
        }

        var contract_format=require(format_src);

        var contract_generator=web3.eth.contract(contract_format.abi);

        // var gasEstimate= web3.eth.estimateGas({data:contract_format.bytecode});
        var gasEstimate=1000000;
        console.log(gasEstimate);
        
        
        //Deploy a new contract on rpc.
        var contract_instance=contract_generator.new(param1,param2,{
            data:contract_format.bytecode,
            from:this.senderAddr,
            gas:gasEstimate
        });

        
        return contract_instance.transactionHash;
    }
}

function medicalDevice(id, name) {
    this.deviceID = id;
    this.deviceName = name;
    this.dataLog = []; // offchain database
    this.submitCount = 0;
    this.generateData = function(newData) {
        dataLog.push({time:new Date(), content: newData});
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
        return this.encrypt(publicKey,result);
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
exports.contractDeployer=contractDeployer;