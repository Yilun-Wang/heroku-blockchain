var express = require('express');
var router = express.Router();
var middleText = ["init"];
var userText = "";
var init = false;
var global = require('../global');


var patientNode = require('../public/javascripts/ethNodes').patientNode;
var deviceNode = require('../public/javascripts/ethNodes').deviceNode;


var the_patientNode;
var the_patient;

var deviceNode1;
var deviceNode2;

var device1;
var device2;
var deviceList;
var deviceNodeList;

async function deployRC(hosturl) {

    console.log(hosturl);
    var utils = require('../bkc_utils');
    var web3 = utils.quickWeb3(hosturl);
    var account = await utils.quickAccount(hosturl)
    var genesysAccount = account.personal;
    var deployer = new utils.contractDeployer(hosturl, genesysAccount);
    var RC = await deployer.RC_deploy()
    global.RC = RC;


}

async function initObjects() {

    // console.log('Global RC',global.RC);
    await deployRC(global.hosturl);

        deviceNode1 = new deviceNode('101', "Blood Pressure Meter", global.hosturl, global.RC);
        deviceNode2 = new deviceNode('102', "Weight Scale", global.hosturl, global.RC);

        device1 = deviceNode1.device;
        device2 = deviceNode2.device;
        deviceList = [device1, device2];
        deviceNodeList = [deviceNode1, deviceNode2];

        the_patientNode = new patientNode('2000', 'Alice', global.hosturl, global.RC);
        the_patient = the_patientNode.patient;

        deviceNode1.init().then(function () {
        deviceNode2.init()
    });
        await the_patientNode.init();

        log("Key Pair Generated.");
        log("Initialization completed.");
    // log("Public Key: " + the_patient.publicKey);


}
function log(message) {
    global.log(message);
}
function flushLog() {
    global.flushLog();
}
router.get('/', function (req, res, next) {
    if (!init) {
        res.render('init');
        }
    else{
    res.render("prototype_2",
    {
        patient: the_patient,
        middleText: global.getLog(),
        userText: userText
    });
}
});

router.get('/init',function(req,res,next){
    
    init = true;
    initObjects().then(function () {
        res.redirect('/prototype');
    });

});

router.get('/genData', function (req, res, next) {

    log("genData");
    if (parseInt(req.query.device) == 1) {
        deviceNode1.generateDataFor(the_patientNode, "Blood Pressure: systolic " + (90 + 30 * Math.random()) + " mmHg, diastolic " + (60 + 30 * Math.random()) + " mmHg.");
    } else {
        deviceNode2.generateDataFor(the_patientNode, "Weight: " + (50 + 5 * Math.random()) + " kg.");
    }
    log("Data generated.");
    res.redirect("/prototype");
});

router.get('/submitDataLog', function (req, res, next) {

    log("submitDataLog");
    var i = parseInt(req.query.device);
    log("Submitting from Device " + i);
    deviceNodeList[i - 1].submitDataLogFor(the_patientNode).then(function () {

        log(deviceNodeList[i - 1].device.deviceName + " summited its data.");
        res.redirect("/prototype");
    }
    );
});

router.get('/userView', function (req, res, next) {


    log(req.query);
    var i = parseInt(req.query.device);
    log("Querying Device " + i);

    the_patientNode.query(deviceNodeList[i - 1]).then(function (result) {

        userText = result;
        // res.send(userText);
        res.redirect('/prototype');
    });
});

router.post('/decryptRSA', function (req, res, next) {

    var plaintext = the_patient.decrypt(req.body.cipher);

    userText = plaintext;

    res.send(userText);

});



module.exports = router;
