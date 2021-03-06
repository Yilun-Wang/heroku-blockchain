var Patient = require('./objects').patient;
var pGateKeeper = require('./gateKeepers').PatientGatekeeper;

var Device = require('./objects').medicalDevice;
var dbGateKeeper = require('./gateKeepers').DbGatekeeper;

var global = require('../../global');

patientNode = function (id, name, hosturl, RC) {

    this.patient = new Patient(id.toString(), name.toString());

    this.gateKeeper;
    this.hosturl = hosturl;
    this.RC = RC;
    this.emDataIndex = 0;

    this.init = async function () {

        if (id != undefined && this.hosturl != undefined && this.RC != undefined) {
            this.gateKeeper = new pGateKeeper(hosturl, id, RC);
            await this.gateKeeper.init();
        }
        else {
            //console.log('Information needed for initialization');
            global.log('Information needed for initialization');
            if (id == undefined)
                //console.log('please provide id');
                global.log('please provide id');
            if (hosturl == undefined)
                //console.log('please provide hosturl');
                global.log('please provide hosturl');
            if (RC == undefined)
                //console.log('please provide RC');
                globalconsole.log('please provide RC');
        }
    }

    this.query = async function (deviceNode, queryIndex = undefined, ownerID = this.patient.patientID) {
        if (this.gateKeeper == undefined) {
            //console.log('gate keeper is not initialized, initializing.');
            global.log('gate keeper is not initialized, initializing.');
            this.init();
        }
        var query = await this.gateKeeper.queryTemplate(deviceNode.gateKeeper, ownerID, queryIndex);

        result = await deviceNode.handleQuery(this.patient.patientID, query.queryObject, query.signature);
        return result;
    }

    this.measure = function (deviceNode) {
        deviceNode.generateDataFor(this);
        // device.submitDataLogFor(this);
    }

    this.submitEmData = async function (plainData, deviceNode) {

        var cipher = this.patient.encryptEm(plainData.toString(0));

        var index = await deviceNode.storeEmDataFor(this, cipher);

        console.log("Patient receiving index:" + index);
        this.emDataIndex = index;

    }
    this.getEmData = async function (deviceNode) {
        var result = await this.query(deviceNode, this.emDataIndex, this.patient.patientID);
        // var plaintext=this.patient.decryptEm(result);
        return result;
    }

}

deviceNode = function (_deviceId, _deviceName, hosturl, RC) {
    this.device = new Device(_deviceId.toString(), _deviceName.toString());
    this.gateKeeper;
    this.hosturl = hosturl;
    this.RC = RC;

    this.init = async function () {

        if (_deviceId != undefined && this.hosturl != undefined && this.RC != undefined) {
            this.gateKeeper = new dbGateKeeper(hosturl.toString(), _deviceId.toString(), RC);
            await this.gateKeeper.init();
        }
        else {
            //console.log('Information needed for initialization');
            global.log('Information needed for initialization');
            if (_deviceId == undefined)
                //console.log('please provide id');
                global.log('please provide id');
            if (hosturl == undefined)
                //console.log('please provide hosturl');
                global.log('please provide hosturl');
            if (RC == undefined)
                //console.log('please provide RC');
                global.log('please provide RC');
        }
    }
    this.generateDataFor = function (patientNode) {

        var data = "Heart Rate:" + (30 + Math.floor(Math.random() * 60));
        this.generateDataFor(patientNode, data);
    }

    this.generateDataFor = function (patientNode, data) {
        this.device.generateData(data, patientNode.patient.publicKey);
    }

    this.storeEmDataFor = async function (patientNode, emData) {
        /*The emData should be encrypted on user side, the device simply store the ciper text. */
        this.device.generateData(emData, null);

        index = this.device.dataLog.length - 1;

        /*Submit the emData hash, and declare it public.*/
        await this.gateKeeper.submitDataHash(patientNode.patient.patientID, index, emData.toString(), false);

        this.device.submitCount = this.device.dataLog.length;
        console.log("Device returning index:" + index);
        return index;
    }

    this.handleQuery = async function (querorID, query_object, signed_query_object) {
        if (this.gateKeeper == undefined) {
            global.log("dbGateKeeper is not initialized yet.");
            await this.init();
        }

        /*If the index is not specified, simply return the latest measurement outcome.*/
        if (query_object.queryIndex == undefined)
            query_object.queryIndex = this.device.dataLog.length - 1;


        permit = await this.gateKeeper.handleQuery(querorID, query_object, signed_query_object);

        if (permit == true)
            return this.device.handleQuery(query_object.queryIndex);
        else {
            return "Error: permission denied";
        }
    }

    this.submitDataLogFor = async function (patientNode) {
        if (this.gateKeeper == undefined)
            await this.init();
        for (var i = this.device.submitCount; i < this.device.dataLog.length; i++) {
            // submit hash(this.device.dataLog[i]) to smart contract
            await this.gateKeeper.submitDataHash(patientNode.patient.patientID, i, this.device.dataLog[i]);
        }
        this.device.submitCount = this.device.dataLog.length;
        return;
    };

}
module.exports.patientNode = patientNode;
module.exports.deviceNode = deviceNode;
