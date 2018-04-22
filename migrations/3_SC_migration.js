var SC = artifacts.require("./PPR.sol");

module.exports = function(deployer) {
    deployer.deploy(SC,"Pengshu","UWProvider");
};
