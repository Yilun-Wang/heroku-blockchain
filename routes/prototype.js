var express = require('express');
var router = express.Router();
var middleText="";
var userText="";
var init=false;

var patient=require("../public/javascripts/objects").patient;
var medicalDevice=require("../public/javascripts/objects").medicalDevice;

var the_patient = new patient(1000,"Alice");
var device1 = new medicalDevice(101, "Blood Pressure Meter");
var device2 = new medicalDevice(102, "Weight Scale");
var deviceList = [device1, device2];


router.get('/', function(req, res, next) {
    if (!init) {
        init=true;
        the_patient.generateKeyPair();
        middleText = middleText.concat("Key Pair Generated. Public Key: "+ the_patient.publicKey);
    }
    res.render("prototype",
        {
            middleText:middleText,
            userText:userText
    });
    //res.send('respond test');
});

router.get('/genData', function(req, res, next) {

    console.log("genData");
    if (parseInt(req.query.device)==1) {
        device1.generateData("Blood Pressure: systolic "+ (90+30*Math.random()) +" mmHg, diastolic "+ (60+30*Math.random()) +" mmHg.\n");
    } else {
        device2.generateData("Weight: "+ (50+5*Math.random()) +" kg.\n");
    }
    res.redirect("/prototype");
});

router.get('/submitDataLog', function(req, res, next) {

    /*var the_device;
    if (req.query.device==1) {
        the_device = device1;
    } else {
        the_device = device2;
    }

    the_device.submitDataLog();
    middleText.concat(the_device.deviceName+" summited its data.<br>");*/

    console.log("submitDataLog");
    var i = parseInt(req.query.device);
    console.log(i);
    deviceList[i-1].submitDataLog();
    middleText = middleText.concat(deviceList[i-1].deviceName+" summited its data.\n");

    res.redirect("/prototype");
});

router.get('/userView', function(req, res, next) {

    console.log("userView");
    var i = parseInt(req.query.device);
    console.log(i);
    userText = the_patient.decrypt(the_patient.privateKey, the_patient.query(deviceList[i-1]));
    res.redirect("/prototype");
});


module.exports = router;
