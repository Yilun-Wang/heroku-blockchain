substring=function(front,end,string){
    var buffer="";
    for(var i=front;i<end&&i<string.length;i++)
        buffer+=string[i];
    
    return buffer;
}


var Web3=require('web3');
var web3=new Web3();
// var gateKeeper=require('../public/javascripts/objects').DbGatekeeper();
var hosturl="http://localhost:8545";
web3.setProvider(new Web3.providers.HttpProvider(hosturl));

var account=web3.eth.accounts[0];
console.log(account);
web3.eth.defaultAccount=account;

var signature=web3.eth.sign(account,"I am the flah").toString();

console.log(signature);

// singature convert to rsv.
sigToRSV=function(signature){

var sigString = substring(2,signature.length,signature);
var r=web3.toHex("0x"+substring(0,64,sigString));
var s=web3.toHex("0x"+substring(64,128,sigString));
var v=27+web3.toDecimal(web3.toHex("0x"+substring(128,130,sigString)));

    return {r:r,s:s,v:v}
}

// console.log(sigToRSV(signature));

module.exports.sigToRSV=sigToRSV;