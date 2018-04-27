var Web3=require('web3');
var web3=new Web3();
// var gateKeeper=require('../public/javascripts/objects').DbGatekeeper();
var hosturl="http://localhost:7545";
web3.setProvider(new Web3.providers.HttpProvider(hosturl));


next=function(address){
    console.log(address);
    var contractDeployer=require('../public/javascripts/objects').contractDeployer;
    
    var deployer=new contractDeployer(hosturl,address);
    
    
    //Deploy a SC
    var SCTemplate=deployer.generateTemplate("SC").template;
    var testAddr=address;
    var contract=deployer.SC_deploy("Peg",testAddr);
    
    // var sign_utils=require('../public/javascripts/sign');
    //Or creating one from existing address.
    // var contract=SCTemplate.at('0x979ed84ff5500ed9d1579f59635f5919d7c80f73');
    /*It is very important that we input a address string, not hex number, to the at method.*/
    // var message="I am the flash.";
    
    // var signature=sign_utils.sign(message,testAccount);
    
    // console.log(contract);
    
    
    }


// var account=web3.eth.accounts.create("pengshu");
var password='peter';
web3.eth.personal.newAccount(password).then(
    function(account){
        console.log("personal account",account);
        var a=account;
        web3.eth.personal.unlockAccount(account,password).then(
            function(result){

                console.log("account unlocked.result:"+a);
                 next(a);
            });
        }
);