





substring=function(front,end,string){
    var buffer="";
    for(var i=front;i<end&&i<string.length;i++)
        buffer+=string[i];
    
    return buffer;
}

// singature convert to rsv.
sigToRSV=function(signature){

var sigString = substring(2,signature.length,signature);
var r=web3.toHex("0x"+substring(0,64,sigString));
var s=web3.toHex("0x"+substring(64,128,sigString));
var v=27+web3.toDecimal(web3.toHex("0x"+substring(128,130,sigString)));

    return {r:r,s:s,v:v}
}

var Web3=require('web3');
var web3=new Web3();

var hosturl="http://localhost:8545";
web3.setProvider(new Web3.providers.HttpProvider(hosturl));

module.exports= {

    sign: function(message,account){
        var h=web3.utils.sha3(message);
        var signature=web3.eth.sign(account,h);
        return signature;
        },
    
    verify: function(signature,message,contract){
        var message="I am the flash";
        var h=web3.sha3(message);    
        var RSV=sigToRSV(signature);
        
        return contract.verify(h,RSV.v,RSV.r,RSV.s);
    }
}    


