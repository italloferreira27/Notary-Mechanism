/** @type import('hardhat/config').HardhatUserConfig */
require('@nomiclabs/hardhat-waffle');
// require("dotenv").config();

module.exports = {
  solidity: "0.8.24",

  networks: {
    hardhat: {
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/<API key>",
      chainId: 11155111,
      accounts: [privateKey1, privateKey2, privateKey3],
    },
    amoy: {
      url: "https://polygon-amoy.g.alchemy.com/v2/<API key>",
      chainId: 80002,
      accounts: [privateKey1, privateKey2, privateKey3],
    },
  },
};
