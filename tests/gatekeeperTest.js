var Web3=require('web3');
var web3=new Web3();
// var gateKeeper=require('../public/javascripts/objects').DbGatekeeper();
var hosturl="http://localhost:7545";
web3.setProvider(new Web3.providers.HttpProvider(hosturl));

var account=web3.eth.accounts[0];
console.log(account);
web3.eth.defaultAccount=account;

var contractDeployer=require('../public/javascripts/objects').contractDeployer;

var deployer=new contractDeployer(hosturl,account);

var RCTemplate=deployer.generateTemplate("RC").template;



//Deploy a RC
var contract=deployer.RC_deploy();


// var SCTemplate=deployer.generateTemplate("SC").template;



// //Deploy a SC
// var contract=deployer.SC_deploy("Peg","0x5cda12df6e25EaA8c6BDA5D1bF02f5563e0eda48");

//Or creating one from existing address.
// var contract=SCTemplate.at('0x80a598142b52f6c5eb867e1e0c74b0916cf117f7')
/*It is very important that we input a address string, not hex number, to the at method.*/

// console.log(contract);


