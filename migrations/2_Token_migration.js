// SPDX-License-Identifier: MIT
const Token = artifacts.require("Token");
const Notary = artifacts.require("Notary");

module.exports = async function(deployer) {
  let holders;

  //Sepolia
  holders = ['0xfe8338eCd24439df698db7D615B3B57110764feB', '0x305fF925335cb4Aad692666b939cB0df8190437C', '0xf7e451fB0038eBafcFd28ee2f887A3803C83A7de']; 

  //Mumbai
  //holders = ['0x7bA98f6a9Ce512e5155b297594D176333FdA1aD3', '0xd4d902D8d6c40F59B217e78380C8190Aad72383B', '0x1283Bd5d3Db837eB0ec0DaB0b0D5aE6f291C22be']; 

  deployer.deploy(Token, holders);
  const tokenInstance = await Token.deployed();
  const tokenAddress = tokenInstance.address;

  await deployer.deploy(Notary, tokenAddress);
};