var hosturl="http://localhost:7545";
var utils=require('../bkc_utils');
var web3=utils.quickWeb3(hosturl);

async function main(){

var password="pengshu";

var account=await web3.eth.personal.newAccount(password);

console.log(account);
let unlock;
try{
unlock=await web3.eth.personal.unlockAccount(account,password);}
catch(e){}
console.log(unlock);

var message="I am the flash";
let signature;
try{
    signature=await web3.eth.sign(message,account);
}catch(e){}
console.log(signature);
// var 
}
main();
// console.log(newAccount(password));
// web3.eth.personal.newAccount(password).then(
//     function(account){
//         console.log("personal account",account);
//         var a=account;
//         web3.eth.personal.unlockAccount(account,password).then(
//             function(result){
//                 var message='I am the flash';
//                 console.log("account unlocked.result:"+a);
//                 web3.eth.sign(message,a).then(
//                     function(result){
//                         console.log(result);
//                     }
//                 );
//                 //  next(a);
//             });
//         }
// );