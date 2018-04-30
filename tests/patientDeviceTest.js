var hosturl="http://localhost:7000";

var utils=require('../bkc_utils');
var web3=utils.quickWeb3(hosturl);
var ethNode=require('../public/javascripts/ethNodes');

var patientID="pengshu";
var patientName="Peter";
var deviceID="fitty";
var deviceName="Fit Band";


async function main() {
    var RC=await utils.deployDumyRC(hosturl);

    var patient=new ethNode.patientNode(patientID,patientName,hosturl,RC);
    var device=new ethNode.deviceNode(deviceID,deviceName,hosturl,RC);
    await patient.init();
    await device.init();
    /*Use case 1: patient do measurement */
    patient.measure(device);
    patient.measure(device);
    patient.measure(device);
    await patient.query(device,0);
    await patient.query(device,1);
    await patient.query(device,2);
    
    /*Use case 2: device submit data */
    await device.submitDataLogFor(patient);
    
    /*Use case 3: patient query data */
    
    patient.query(device,0).then(
        function(result){
        console.log("Result:",result);
        console.log("Plain text:",patient.patient.decrypt(result));
                                });

    patient.query(device,1).then(
        function(result){
        console.log("Result:",result);
        console.log("Plain text:",patient.patient.decrypt(result));
                                });                                

    patient.query(device,2).then(
        function(result){
        console.log("Result:",result);
        console.log("Plain text:",patient.patient.decrypt(result));
                                });
    }
main();
// var message="I am the flash";
// var ciper=device.device.encrypt(patient.patient.publicKey,message);
// console.log("ciper",ciper);
// var plaintext=patient.patient.decrypt(ciper);
// console.log('plain text:',plaintext);
// main();
