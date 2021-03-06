var Web3=require('web3');
var web3=new Web3();

var hosturl="http://localhost:7545";
web3.setProvider(new Web3.providers.HttpProvider(hosturl));


next=function(address){
    console.log(address);
    var contractDeployer=require('../bkc_utils').contractDeployer;
    
    var deployer=new contractDeployer(hosturl,address);
    
    
    //Deploy a SC
    var SCTemplate=deployer.generateTemplate("SC").template;
    var testAddr=address;
    var contract=deployer.SC_deploy("Peg",testAddr);
        
    }


// var account=web3.eth.accounts.create("pengshu");
var password='peter';

async function personalDeploy(){
    var personalAccount=await web3.eth.personal.newAccount(password);
    let unlock;
    try{
    unlock=await web3.eth.personal.unlockAccount(personalAccount,password);}catch(e){console.log(e);}
    console.log(unlock);
    next(personalAccount);    
}
// personalDeploy();

var gateKeeper=require('../public/javascripts/objects').DbGatekeeper;
var keeper=new gateKeeper(hosturl,"xxx");

function testSignature(){
    var query="10";
    var dummyAccount=web3.eth.accounts.create("dummy entropy");
    var message="Why so serious.";
    var signature=dummyAccount.sign(message);

    console.log(keeper.verifyIdentity(signature,dummyAccount.address));

    console.log(keeper.verifyIdentity(signature,"randomness"));
}