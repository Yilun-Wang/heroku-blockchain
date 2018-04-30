var hosturl="http://localhost:7545";
var utils=require('../bkc_utils');
var web3=require('../bkc_utils').quickWeb3(hosturl);

async function deployDumyRC(hosturl){


    var web3=utils.quickWeb3(hosturl);
    var deployer=utils.contractDeployer;
    
    var genesysAccount=await web3.eth.personal.newAccount("genesys");
  
    let unlock;
    try{
        unlock=await web3.eth.personal.unlockAccount(genesysAccount,"genesys");}catch(e){console.log(e);}
    
    var d=new deployer(hosturl,genesysAccount);
    
    var result= await d.RC_deploy();
    // console.log(result);
    return result;
        // console.log(app.locals.RC);
  
  }

async function main(){
    /*Account creation*/    
    var account=web3.eth.accounts.create("rand");
    
    var personal= await web3.eth.personal.newAccount(account.privateKey);
    
    /*Account unlock*/
    var unlock;
    try{
    unlock=await web3.eth.personal.unlockAccount(personal,account.privateKey);
    if(unlock==true)
        console.log("Successful unlock");
    }catch(e){console.log(e)};

    /*RC deployment */
    var RC=await deployDumyRC(hosturl);
    

    /*Register and get ethAddr*/
    var id="pengshu";
    var eth=personal;
    
    let result;
    try{
        result=await RC.methods.registerEthAddr(id,eth).send({from:personal,gasPrice:'0'});
    }catch(e){console.log(e);}
    // console.log(result);
    
    try{
        result=await RC.methods.getEthAddr(id).call({from:personal,gasPrice:'0'});
    }catch(e){console.log(e);}
    console.log("Eth address:",result);

    /*Deploy SC address*/
    var deployer=require('../bkc_utils').contractDeployer;
    deployer=new deployer(hosturl,personal);
    var SC=await deployer.SC_deploy("The Flash",personal);
    
    /*Register SC for patient on RC */
    try{
        result=await RC.methods.registerSCAddr(id,SC.options.address).send({from:personal,gasPrice:'0'});
    }catch(e){console.log(e);}
    
    try{
        result=await RC.methods.getSCAddr(id).call({from:personal,gasPrice:'0'});
    }catch(e){console.log(e);}
    console.log("SC address:",result);
    
    try{
        result=await RC.methods.getSCAddr("not exist").call({from:personal,gasPrice:'0'});
    }catch(e){console.log(e);}
    console.log("SC address:",result);
    
    var providerId="Dummy Provider ID";
    /*Deploy PPR*/
    var PPR=await deployer.PPR_deploy(id,providerId);

    var message="Heart Rate:50 rpm";
    var msgHash=web3.utils.sha3(message);
    console.log("msg hash:",msgHash)
    /*Push a new record hash onto PPR*/
    try{
        result=await PPR.methods.updateDataHash(0,msgHash).send({from:personal,gasPrice:'0'});
    }catch(e){console.log(e);}
    /*Access the data hash */
    try{
        result=await PPR.methods.getDataHash(0).call({from:personal,gasPrice:'0'});
    }catch(e){console.log(e);}
    console.log("hash of list[0]:",web3.utils.numberToHex(result));
    /*Update the permission to: private, corresponding to the data hash*/
    try{
        result=await PPR.methods.updatePermission(0,0).send({from:personal,gasPrice:'0'});
    }catch(e){console.log(e);}



    /*Add PPR to SC*/
    // try{
    //     console.log(PPR.options.address);
    //     result=await SC.methods.addPPR(providerId,PPR.options.address).send({from:personal,gasPrice:'0'});
    // }catch(e){console.log(e);}
    SC.methods.addPPR(providerId,PPR.options.address).send({from:personal,gasPrice:'0'}).then(function(receipt){
        console.log("Add ppr result:",receipt);
    });
    /*Get PPR address from SC*/
    try{

        result=await SC.methods.getPPRAddress(providerId).call({from:personal,gasPrice:'0'});
    }catch(e){console.log(e);}
    console.log('PPR Address:',result);

    
    // RC.methods.getSCAddr(id).call(function(err,result){
    //     console.log(result);
    // });
    
}
main();