





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
    contractDeployer: function(_url_toDeploy,_senderAddr){
        var Web3=require('web3');
        var web3=new Web3(new Web3.providers.HttpProvider(_url_toDeploy));
        web3.eth.defaultAccount=_senderAddr;
    
        this.url_toDeploy=_url_toDeploy;
        console.log("_senderAddr",_senderAddr);
        this.senderAddr=_senderAddr;
    
        if(this.url_toDeploy==undefined)
            url_toDeploy="http://localhost:8545";
    
       
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
    
        this.generateTemplate=function(sc_type){
          
            var format_src;
            switch(sc_type){
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
    
        this.deploy_template=function(sc_type,param1,param2){
            
            var contract_generator=this.generateTemplate(sc_type);
         
            
            console.log("Deploying contract.");
            var gasEstimate=1000000;
            //Deploy a new contract on rpc.
            console.log(this.senderAddr);
    
            var contract_instance=contract_generator.template.deploy(
            {
                data:contract_generator.format.bytecode,
                arguments:[param1,param2]
            }).send({gas:gasEstimate,gasPrice:'0',from:this.senderAddr},function(err,transactionHash){
                if(!err)
                    {
                        console.log("Contract Deployed.");
                        
                        console.log("TxHash:",transactionHash);
                    }
                else    
                    console.log(err);
            });
           
            return contract_instance;
        }
        
    },
    quickWeb3: function(hosturl){
        var Web3=require('web3');
        var web3=new Web3();
        web3.setProvider(new Web3.providers.HttpProvider(hosturl));
        return web3;
    }
    
    
}    


