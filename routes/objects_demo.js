var express = require('express');
var router = express.Router();
var patientList=[];
var cipherText="";
var plainText="";

var patient=require("../public/javascripts/objects").patient;
/* GET home page. */
patientList.push(new patient(1000,"dummy"));

findPatient=function(patientID){

    for(var p of patientList)
        if(p.patientID==patientID)
            return p;

    return null;
}

render=function(res){
    res.render("objects_demo",
        {
            patientList: patientList,
            cipherText:cipherText,
            plainText:plainText
    });
}
router.get('/', function(req, res, next) {
    render(res);
});

router.post('/CreatePatient', function(req, res, next) {

    var p=new patient(req.body.PatientID,req.body.PatientName);
    patientList.push(p);
    res.redirect("/objects");
});


router.get('/EmEncrypt', function(req, res, next) {

    var patientID=req.query.patientID;
    var message=req.query.message;
    patient = findPatient(patientID);
    if(patient!=null)
        cipherText=patient.encryptEm(message);
    else
        cipherText="Patient not found.";

    res.redirect("/objects");
});

router.get('/EmDecrypt', function(req, res, next) {

    var patientID=req.query.patientID;
    var message=req.query.CipherText;
    patient = findPatient(patientID);
    if(patient!=null)
        plainText=patient.decryptEm(message);
    else
        plainText="Patient not found.";

    res.redirect("/objects");
});

// router.get('/CreateKeyPair',function(req,res,next)){
//
// });

module.exports = router;
