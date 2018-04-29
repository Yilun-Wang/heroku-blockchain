





substring=function(front,end,string){
    var buffer="";
    for(var i=front;i<end&&i<string.length;i++)
        buffer+=string[i];
    
    return buffer;
}

// singature convert to rsv.
sigToRSV=function(signature){

var sigString = substring(2,signature.length,signature);
var r=web3.toHex("0x"+substring(0,64,sigString));
var s=web3.toHex("0x"+substring(64,128,sigString));
var v=27+web3.toDecimal(web3.toHex("0x"+substring(128,130,sigString)));

    return {r:r,s:s,v:v}
}

var Web3=require('web3');
var web3=new Web3();

var hosturl="http://localhost:8545";
web3.setProvider(new Web3.providers.HttpProvider(hosturl));

module.exports= {
    newAccountPromise: function(password){
        return web3.eth.personal.newAccount(password);
    },
    signPromise: function(dataToSign,address,password){
        return web3.eth.sign(dataToSign,address);
    },
    // sign: function(message,account){
    //     var h=web3.utils.sha3(message);
    //     var signature=web3.eth.sign(account,h);
    //     return signature;
    //     },
    
    // verify: function(signature,message,contract){
    //     var message="I am the flash";
    //     var h=web3.sha3(message);    
    //     var RSV=sigToRSV(signature);
        
    //     return contract.verify(h,RSV.v,RSV.r,RSV.s);
    // },

    /*The contractDeployer deploys MedRec contracts on sender's demand, 
to a specific deployment url, using a specific address.*/
    /*Users need to specify which contract to deploy, and pass in the 
parameters used in the constructor of contracts.*/
    contractDeployer: function(_url_toDeploy,_senderAddr){
        var Web3=require('web3');
        var web3=new Web3(new Web3.providers.HttpProvider(_url_toDeploy));
        
        web3.eth.defaultAccount=_senderAddr;
    
        this.url_toDeploy=_url_toDeploy;
        // console.log("_senderAddr",_senderAddr);
        this.senderAddr=_senderAddr;
    
        if(this.url_toDeploy==undefined)
            url_toDeploy="http://localhost:8545";
    
    this.Contract_at=function(contractType,address){
        var RC=this.generateTemplate(contractType).template;
        RC.options.address=address;
        return RC;
    }
    
       this.RC_deploy=async function(){
           console.log("Deploying an RC");
           let result;
            try{
            result=await this.deploy_template("RC");}catch(e){console.log(e);}
            return result;
           
    }
        this.PPR_deploy=async function(patientID,providerID){
            console.log("Deploying an PPR");
            let result;
            try{
            result=await this.deploy_template("PPR",patientID.toString(),providerID.toString());}catch(e){console.log(e);}
            return result;
        
    }
        this.SC_deploy=async function(RegistrarID,RegistrarEthAddr){
            console.log("Deploying an SC");
            let result;
            try{
            result=await this.deploy_template("SC",RegistrarID.toString(),RegistrarEthAddr);}catch(e){console.log(e);}
            return result;
    }
    
        this.generateTemplate=function(contractType){
          
            var format_src;
            switch(contractType){
                case "RC": format_src='./build/contracts/RC.json'; break;
                case "PPR": format_src='./build/contracts/PPR.json'; break;
                case "SC": format_src='./build/contracts/SC.json'; break;
                default: console.log('Unknown contract type.'); return undefined;
            }
    
            var contract_format=require(format_src);
            // var gasEstimate= web3.eth.estimateGas({data:contract_format.bytecode});
            
            
            var contract_generator=new web3.eth.Contract(contract_format.abi);
    
            return {template:contract_generator,format:contract_format};
        }
    
        this.deploy_template=async function(sc_type,param1,param2){
            
            var contract_generator=this.generateTemplate(sc_type);
          
            
            // console.log("Deploying contract.");

            var gasEstimate=1000000;
            //Deploy a new contract on rpc.
            // console.log(this.senderAddr);
    
            let contract_instance;
            try{
            contract_instance=await contract_generator.template.deploy(
            {
                data:contract_generator.format.bytecode,
                arguments:[param1,param2]
            }).send({gas:gasEstimate,gasPrice:'0',from:this.senderAddr});}catch(e){console.log("err",e);}
           console.log("Deployment complete");
            return contract_instance;
        }
        
    },
    quickWeb3: function(hosturl){
        var Web3=require('web3');
        var web3=new Web3();
        web3.setProvider(new Web3.providers.HttpProvider(hosturl));
        return web3;
    },
    quickAccount: async function(hosturl){
        var Web3=require('web3');
        var web3=new Web3();
        web3.setProvider(new Web3.providers.HttpProvider(hosturl));

        var nounce=Math.random().toString();
        /*Account creation*/    
        var account=web3.eth.accounts.create(web3.utils.sha3(nounce));
        
        var personal= await web3.eth.personal.newAccount(account.privateKey);
        
        /*Account unlock*/
        var unlock;
        try{
        unlock=await web3.eth.personal.unlockAccount(personal,account.privateKey);
        if(unlock==true)
            console.log("Successful unlock");
        }catch(e){console.log(e)};

        return {account:account,personal:personal};
    },
   deployDumyRC:async function(hosturl){
        var quickWeb3=module.exports.quickWeb3;
        var web3=quickWeb3(hosturl);
        var deployer=module.exports.contractDeployer;
        
        var genesysAccount=await web3.eth.personal.newAccount("genesys");
      
        let unlock;
        try{
            unlock=await web3.eth.personal.unlockAccount(genesysAccount,"genesys");}catch(e){console.log(e);}
        
        var d=new deployer(hosturl,genesysAccount);
        
        var result= await d.RC_deploy();
        return result;
      
      },
      prefixhash: function (message){
        return web3.utils.sha3("\x19Ethereum Signed Message:\n" + message.length + message);
    }
    
    
    
}    


