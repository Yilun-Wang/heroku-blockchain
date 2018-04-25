var Web3=require('web3');



var web3_instance=new Web3();

web3_instance.setProvider(new web3_instance.providers.HttpProvider('https://fathomless-depths-36951.herokuapp.com/'));
// web3_instance.setProvider(ganache.provider());

var coinbase=web3_instance.eth.coinbase;
console.log(coinbase);
console.log(web3_instance.eth.getBalance(coinbase));
console.log(web3_instance.eth.getBlock(0));




