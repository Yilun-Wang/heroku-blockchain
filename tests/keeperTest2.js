

var hosturl="http://localhost:7545";

var utils=require('../bkc_utils');
var web3=utils.quickWeb3(hosturl);

async function main(){

/*account creationg*/
var account,personal;
var patientID='pengshu';
var result=await utils.quickAccount(hosturl);    
account=result.account;
personal=result.personal;

var providerId="Dumb Provider";
/*Deploy dummy RC */
var RC=await utils.deployDumyRC(hosturl);
/*Deploy a patient SC */
var deployer=utils.contractDeployer;
deployer=new deployer(hosturl,personal);
var SC=await deployer.SC_deploy(patientID,personal);
/*Register SC and patient Address on RC*/
await RC.methods.registerSCAddr(patientID,SC.options.address).send({from:personal,gasPrice:'0'});
await RC.methods.registerEthAddr(patientID,personal).send({from:personal,gasPrice:'0'});
/*Populate a new PPR*/

var PPR=await deployer.PPR_deploy(patientID,providerId);

var message="Heart Rate:50 rpm";
var msgHash=web3.utils.sha3(message);
console.log("msg hash:",msgHash)

await PPR.methods.updateDataHash(0,msgHash).send({from:personal,gasPrice:'0'});
await PPR.methods.updatePermission(0,1).send({from:personal,gasPrice:'0'});
await PPR.methods.updateDataHash(1,msgHash).send({from:personal,gasPrice:'0'});
await PPR.methods.updatePermission(1,0).send({from:personal,gasPrice:'0'});

/*Push the PPR onto SC*/
await SC.methods.addPPR(providerId,PPR.options.address).send({from:personal,gasPrice:'0'});

/*Initialize a gatekeeper for the provider*/
var gatekeeper=require('../public/javascripts/ethNodes').DbGatekeeper;
gatekeeper=new gatekeeper(hosturl,RC,providerId);
await gatekeeper.init();

/*Get profile by id*/
var result=await gatekeeper.getPatientProfile(patientID);

// var result=await gatekeeper.getPatientProfile("not exist");

result=await gatekeeper.verifyPermission(patientID,{ownerID:patientID,queryIndex:0});
console.log(result);

result=await gatekeeper.verifyPermission(patientID,{ownerID:patientID,queryIndex:1});
console.log(result);


result=await gatekeeper.verifyPermission("nobody",{ownerID:patientID,queryIndex:1});
console.log(result);


result=await gatekeeper.verifyPermission("nobody",{ownerID:patientID,queryIndex:0});
console.log(result);

}
main();