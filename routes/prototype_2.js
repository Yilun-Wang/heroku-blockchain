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


function initObjects() {

    deviceNode1 = new deviceNode('101', "Blood Pressure Meter", global.hosturl, global.RC);
    deviceNode2 = new deviceNode('102', "Weight Scale", global.hosturl, global.RC);

    device1 = deviceNode1.device;
    device2 = deviceNode2.device;
    deviceList = [device1, device2];
    deviceNodeList = [deviceNode1, deviceNode2];

    the_patientNode = new patientNode('2000', 'Alice', global.hosturl, global.RC);
    the_patient = the_patientNode.patient;
    // console.log('Global RC',global.RC);
    deviceNode1.init().then(function () {
        deviceNode2.init().then(function () {

            the_patientNode.init().then(function () {

                log("Key Pair Generated.");
                
                // log("Public Key: " + the_patient.publicKey);

            });
        });
    });

}
function log(message) {
    middleText.push(message.toString());
}
function flushLog() {
    middleText = [];
}
router.get('/', function (req, res, next) {
    if (!init) {
        init = true;
        initObjects();
    }

    res.render("prototype_2",
        {
            patient:patientNode.patient,
            middleText: middleText,
            userText: userText
        });



});

router.get('/genData', function (req, res, next) {

    console.log("genData");
    if (parseInt(req.query.device) == 1) {
        deviceNode1.generateDataFor(the_patientNode, "Blood Pressure: systolic " + (90 + 30 * Math.random()) + " mmHg, diastolic " + (60 + 30 * Math.random()) + " mmHg.");
    } else {
        deviceNode2.generateDataFor(the_patientNode, "Weight: " + (50 + 5 * Math.random()) + " kg.");
    }
    log("Data generated.");
    res.redirect("/prototype");
});

router.get('/submitDataLog', function (req, res, next) {

    console.log("submitDataLog");
    var i = parseInt(req.query.device);
    console.log(i);
    deviceNodeList[i - 1].submitDataLogFor(the_patientNode).then(function () {

        log(deviceNodeList[i - 1].device.deviceName + " summited its data.");
        res.redirect("/prototype");
    }
    );
});

router.get('/userView', function (req, res, next) {

    
    console.log(req.query);
    var i = parseInt(req.query.device);
    console.log(i);

    the_patientNode.query(deviceNodeList[i - 1]).then(function (result) {

        userText = result;
        res.send(userText);
        });
});

router.post('/decryptRSA', function (req, res, next) {
   
    var plaintext=the_patient.decrypt(req.body.cipher);
    
    userText=plaintext;

    res.send(userText);
    
});



module.exports = router;
