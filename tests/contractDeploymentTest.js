var Web3=require('web3');


var hosturl="https://fathomless-depths-36951.herokuapp.com/";

var web3=new Web3(new Web3.providers.HttpProvider(hosturl));


var sender=web3.eth.accounts[0];

var contractDeployer=require('../public/javascripts/objects').contractDeployer;

var deployer=new contractDeployer(hosturl,sender);

///Deploy a RC
var hash=deployer.RC_deploy();

var contractAddr=web3.eth.getTransactionReceipt(hash).contractAddress;

console.log(contractAddr);

///Deploy a SC
var hash=deployer.SC_deploy('Pengshu',web3.eth.accounts[0]);

var contractAddr=web3.eth.getTransactionReceipt(hash).contractAddress;

console.log(contractAddr);

//Deploy a PPR
var hash=deployer.PPR_deploy("Pengshu","P1");

var contractAddr=web3.eth.getTransactionReceipt(hash).contractAddress;

console.log(contractAddr);

