var Web3=require('web3');
var web3=new Web3();
// var gateKeeper=require('../public/javascripts/objects').DbGatekeeper();
var hosturl="http://localhost:8545";
web3.setProvider(new Web3.providers.HttpProvider(hosturl));

var account=web3.eth.accounts[0];
console.log(account);
web3.eth.defaultAccount=account;


var contractDeployer=require('../public/javascripts/objects').contractDeployer;

var deployer=new contractDeployer(hosturl,account);

var SCTemplate=deployer.generateTemplate("SC").template;



//Deploy a RC
var contract=deployer.SC_deploy("Peg",account);

//Or creating one from existing address.
// var contract=SCTemplate.at('0x80a598142b52f6c5eb867e1e0c74b0916cf117f7')
/*It is very important that we input a address string, not hex number, to the at method.*/

// console.log(contract);



sign=function(message,account){
var message="I am the flash";
var h=web3.sha3(message);
var signature=web3.eth.sign(account,h);
return signature;
}

verify=function(signature,message,contract){

var message="I am the flash";
var h=web3.sha3(message);    
var sigToRSV=require('./signatureVerificationTest').sigToRSV;
var RSV=sigToRSV(signature);


return contract.verify(h,RSV.v,RSV.r,RSV.s);
}
