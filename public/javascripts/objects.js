function medicalDevice(id, name) {
    this.deviceID = id;
    this.deviceName = name;
    this.dataLog = ["deviceCreated"]; // offchain database
    this.submitCount = 0;
    
    this.generateData = function(newData,publicKey=null) {
        var now=new Date();       
        var data="\nTime:"+now+"\nContent:"+newData;
        
        if(publicKey==null)
            this.dataLog.push(data);
        else
            this.dataLog.push(this.encrypt(publicKey,data+""));
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
    
    this.handleQuery = function(index) {
        var result;
        if (index < this.dataLog.length) {
            // result = this.dataLog.slice(this.submitCount - count, this.submitCount); // newest records
            result=this.dataLog[index];
        }
        return result;
    };

    this.encrypt = function(publicKey, data) {
        var cryptico=require('../../node_modules/cryptico');

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
    this.generateKeyPair();

    this.decrypt = function(cipher,privateKey=this.privateKey) {

        var cryptico=require('cryptico');
        var decryption = cryptico.decrypt(cipher,privateKey);
        
        return decryption.plaintext; // plain text, no decryption
    };
    
}

exports.patient=patient;
exports.medicalDevice=medicalDevice;

