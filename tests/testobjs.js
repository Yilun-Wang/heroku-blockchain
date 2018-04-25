
//Requiring local module.
var patient=require("./public/javascripts/objects").patient;

var p=new patient("pengshu","peter");

console.log(""+p.emKey);

p.generateKeyPair();

console.log(""+p.publicKey);

var message="I am the flash.";

var medicalDevice=require("./public/javascripts/objects").medicalDevice;
var medDv=new medicalDevice("1200","Blood Pressure Meter");
var ciper=medDv.encrypt(p.publicKey,message);

console.log(ciper);

var decryption=p.decrypt(p.privateKey,ciper);

console.log(decryption);
