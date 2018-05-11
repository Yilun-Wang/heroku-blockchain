var express = require('express');
var router = express.Router();
var middleText = [];
var midTextTitle = '';
var userText = "";
var emData = "dummy";
var init = false;
var pendingCnt = [0, 0];
var global = require('../global');


var patientNode = require('../public/javascripts/ethNodes').patientNode;
var deviceNode = require('../public/javascripts/ethNodes').deviceNode;


var the_patientNode;
var the_patient;

var deviceNode1;
var deviceNode2;
var emNode;

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

    deviceNode1 = new deviceNode('BP', "Blood Pressure Meter", global.hosturl, global.RC);
    deviceNode2 = new deviceNode('WS', "Weight Scale", global.hosturl, global.RC);
    emNode = new deviceNode('EM', "Emergency Data Storage", global.hosturl, global.RC);

    device1 = deviceNode1.device;
    device2 = deviceNode2.device;
    deviceList = [device1, device2];
    deviceNodeList = [deviceNode1, deviceNode2, emNode];

    the_patientNode = new patientNode('Alice', 'Alice', global.hosturl, global.RC);
    the_patient = the_patientNode.patient;

    deviceNode1.init().then(function () {
        deviceNode2.init().then(function () {
            emNode.init();
        })
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
    else {
        /*If the middle text is not initialized, set it to default value. */
        if (middleText.length == 0) {
            var log = global.getLog();
            middleText = log.slice(log.length - 5, log.length);
        }
        if (midTextTitle == "")
            midTextTitle = "Event Log";

        res.render("prototype_2",
            {
                // patient: the_patient,
                emData: emData,
                midTextTitle: midTextTitle,
                middleText: middleText,
                userText: userText,
                pendingCnt: pendingCnt
            });

        middleText = [];
        midTextTitle = "";
    }
});

router.get('/init', function (req, res, next) {

    init = true;
    initObjects().then(function () {
        flushLog();
        res.redirect('/prototype');
    });

});

router.get('/genData', function (req, res, next) {

    log("genData");
    var newData = "";
    if (parseInt(req.query.device) == 1) {
        newData = "Blood Pressure: systolic " + (Math.round((90 + 30 * Math.random()) * 100) / 100) + " mmHg, diastolic " + (Math.round((60 + 30 * Math.random()) * 100) / 100) + " mmHg.";
        deviceNode1.generateDataFor(the_patientNode, newData);
        pendingCnt[0]++;
    } else {
        newData = "Weight: " + (Math.round((50 + 5 * Math.random()) * 100) / 100) + " kg.";
        deviceNode2.generateDataFor(the_patientNode, newData);
        pendingCnt[1]++;
    }
    log("Data generated.");
    // res.redirect("/prototype");
    res.send(newData);
});


router.get('/getDataLog', function (req, res, next) {

    var newData = "";
    var deviceName = '';
    if (parseInt(req.query.device) == 1) {
        newData = device1.dataLog;
        deviceName = "Blood Pressure";
    } else {
        newData = device2.dataLog;
        deviceName = "Weight";
    }

    middleText = newData.slice(newData.length - 5, newData.length);
    midTextTitle = "Data Log:" + deviceName;
    res.send('Success');
});

router.get('/submitDataLog', function (req, res, next) {

    log("submitDataLog");
    var i = parseInt(req.query.device);
    log("Submitting from Device " + i);
    deviceNodeList[i - 1].submitDataLogFor(the_patientNode).then(function () {

        pendingCnt[i - 1] = 0;
        log(deviceNodeList[i - 1].device.deviceName + " summited its data.");
        // res.redirect("/prototype");
        res.send(deviceNodeList[i - 1].device.deviceName + " summited its data.");
    }
    );
});

router.get('/userView', function (req, res, next) {

    //log(req.query);
    var i = parseInt(req.query.device);
    log("Querying Device " + i);

    the_patientNode.query(deviceNodeList[i - 1]).then(function (result) {

        userText = result;
        res.send(userText);
        // res.redirect('/prototype');
    });
});

router.post('/decryptRSA', function (req, res, next) {

    var plaintext = the_patient.decrypt(req.body.cipher);

    userText = plaintext;

    res.send(userText);

});

router.get("/submitEmergency", function (req, res, next) {
    
    var string=JSON.stringify(req.query);
    console.log("JSONstring:",string);
    
    the_patientNode.submitEmData(string, emNode).then(function () {
        log("Emergency Data Created. Index=" + the_patientNode.emDataIndex);
        res.send("Success. Index=" + the_patientNode.emDataIndex);
    });
});


router.get("/viewEmergency", function (req, res, next) {
    the_patientNode.getEmData(emNode).then(function (result) {
        console.log("em result:"+result);
        res.send(result);
    });
});



router.get("/emDecrypt", function (req, res, next) {
    var plaintext = the_patientNode.patient.decryptEm(req.query.emData);
    if (plaintext == "Decryption Fails") {
        plaintext = "";
    }
    res.send(plaintext);
});

module.exports = router;
