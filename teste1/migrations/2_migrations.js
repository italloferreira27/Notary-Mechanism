const pay = artifacts.require("pay");

module.exports = function (deployer) {
  deployer.deploy(pay);
};
