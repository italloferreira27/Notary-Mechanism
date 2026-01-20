const { ethers } = require("hardhat");
require("dotenv").config();

const TokenABI = require("../artifacts/contracts/Token.sol/Token.json");

const { NODE_URL_AMOY, AMOY_PRIVATE_KEY01, TOKEN_ADDRESS_AMOY, NOTARY_ADDRESS_AMOY } = process.env;

async function main() {
    const notaryAddressAmoy = NOTARY_ADDRESS_AMOY;
    const tokenAddressAmoy = TOKEN_ADDRESS_AMOY;

    const amoyProvider = new ethers.JsonRpcProvider(NODE_URL_AMOY);
    const amoyWallet = new ethers.Wallet(AMOY_PRIVATE_KEY01, amoyProvider);
    const amoyTokenContract = new ethers.Contract(tokenAddressAmoy, TokenABI.abi, amoyWallet);

    const balance = await amoyTokenContract.balanceOf(amoyWallet.address);
    const allowance = await amoyTokenContract.allowance(amoyWallet.address, notaryAddressAmoy);

    console.log(`Address: ${amoyWallet.address}`);
    console.log(`Token Address: ${tokenAddressAmoy}`);
    console.log(`Notary Address: ${notaryAddressAmoy}`);
    console.log(`Balance: ${ethers.formatEther(balance)} tokens`);
    console.log(`Allowance: ${ethers.formatEther(allowance)} tokens`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
