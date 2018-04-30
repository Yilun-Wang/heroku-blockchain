var hosturl="http://localhost:7545";
var utils=require('../bkc_utils');
var web3=utils.quickWeb3(hosturl);


//Relative synchronize signature using personal sign.
async function main(){

var password="pengshu";

var oneBranchAccount=await web3.eth.personal.newAccount(password);
console.log("one branch",oneBranchAccount);


let unlock;

try{
    unlock=await web3.eth.personal.unlockAccount(oneBranchAccount,password);}
catch(e){}
    console.log("one branch unlock",unlock);
    

var message="I am the flash";
let signature;
try{
    signature=await web3.eth.sign(message,oneBranchAccount);
}catch(e){}
console.log("signature one branch:",signature);

let verfication;
try {
    verification= await web3.eth.personal.ecRecover(message,signature);
}catch(e){console.log(e);}
console.log(verfication);
}
// main();

//Off chain signature and recover using web3 1.0
// var ethAccount=web3.eth.accounts.create("random entropy");
// console.log(ethAccount);
var message={number:1,character:'k'};

async function main2(){
ethAccount=await utils.quickAccount(hosturl);
console.log("personal",ethAccount.personal);
signature= await web3.eth.sign(utils.prefixhash(message),ethAccount.personal);
console.log(signature);
console.log(await web3.eth.accounts.recover(utils.prefixhash(message),signature));
}

main2();
// var message='Some data';
// console.log(web3.utils.sha3("\x19Ethereum Signed Message:\n" + message.length+message));