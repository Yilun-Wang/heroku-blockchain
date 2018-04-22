var PPR = artifacts.require("./PPR.sol");

module.exports = function(deployer) {
  deployer.deploy(PPR,"Pengshu","UWProvider");
};
