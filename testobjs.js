
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
//Requiring server module.
// var http = require('http');
// var url = require('url');
// var fs = require('fs');
// var app=require('./app');
//
// //Resolve pathname and return the corresponding html.
// http.createServer(function (req, res) {
//   var q = url.parse(req.url, true);
//   var filename = "." + q.pathname;
//   fs.readFile(filename, function(err, data) {
//     if (err) {
//       res.writeHead(404, {'Content-Type': 'text/html'});
//       return res.end("404 Not Found");
//     }
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write(data);
//     return res.end();
//   });
// }).listen(8080);
//
//
// //Capturing file opening event.
// var rs = fs.createReadStream('./views/objects.html');
// rs.on('open', function () {
//   console.log('The file is open');
// });