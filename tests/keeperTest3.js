var hosturl="http://localhost:7545";

var utils=require('../bkc_utils');
var web3=utils.quickWeb3(hosturl);

async function main() {
    var RC=await utils.deployDumyRC(hosturl);

    /*Create a db keeper. */
    var providerId="RookieProvider";
    var gatekeeper=require('../public/javascripts/gateKeepers').DbGatekeeper;
    gatekeeper=new gatekeeper(hosturl,RC,providerId);
    await gatekeeper.init();

    

    var patientID="Flashy";
    var patientKeeper=require('../public/javascripts/gateKeepers').PatientGatekeeper;
    patientKeeper=new patientKeeper(hosturl,patientID,RC);
    await patientKeeper.init();
    await patientKeeper.query(gatekeeper,patientID,0);

    
    // await gatekeeper.submitDataHash(patientID,0,"I am the flash");

}
main();