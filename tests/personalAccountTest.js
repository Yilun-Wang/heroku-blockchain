var hosturl="http://localhost:7545";
var web3=require('../bkc_utils').quickWeb3(hosturl);

var account=web3.eth.accounts.create("rand");

console.log("account",account);

web3.eth.personal.newAccount(account.privateKey).then(function(personal){console.log("personal",personal)});
