require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('fs');
require("dotenv").config();
const { parseEther } = require('ethers/lib/utils');

const NotaryABI = require("../artifacts/contracts/Notary.sol/Notary.json");
const TokenABI = require("../artifacts/contracts/Token.sol/Token.json");

const {NODE_URL_SEPOLIA, NODE_URL_AMOY, SEPOLIA_PRIVATE_KEY, AMOY_PRIVATE_KEY} = process.env;

async function main() {

    const tokenAddressSepolia = "<addressTokenSepolia>"; // add token contract address on sepolia network
    const notaryAddressSepolia = "<addressNotarySepolia>"; // add notary contract address on sepolia network

    const tokenAddressAmoy = "<addressTokenAmoy>"; // add token contract address on amoy network
    const notaryAddressAmoy = "<addressNotaryAmoy>"; // add notary contract address on amoy network   

    const sepoliaProvider = new ethers.providers.JsonRpcProvider(NODE_URL_SEPOLIA);
    const amoyProvider = new ethers.providers.JsonRpcProvider(NODE_URL_AMOY);

    const sepoliaWallet = new ethers.Wallet(SEPOLIA_PRIVATE_KEY, sepoliaProvider);
    const amoyWallet = new ethers.Wallet(AMOY_PRIVATE_KEY, amoyProvider);

    const sepoliaTokenContract = new ethers.Contract(tokenAddressSepolia, TokenABI.abi, sepoliaWallet);
    const sepoliaNotaryContract = new ethers.Contract(notaryAddressSepolia, NotaryABI.abi, sepoliaWallet);
    const amoyTokenContract = new ethers.Contract(tokenAddressAmoy, TokenABI.abi, amoyWallet);
    const amoyNotaryContract = new ethers.Contract(notaryAddressAmoy, NotaryABI.abi, amoyWallet);

    const amount = parseEther('1');
    const aproveSepolia = await sepoliaTokenContract.connect(sepoliaWallet).approve(sepoliaNotaryContract.address, amount);
    aproveSepolia.wait();

    const depositSepolia = await sepoliaNotaryContract.connect(sepoliaWallet).deposit(amount, "<amoyAccountAddress>", { gasLimit: 1000000 });
    depositSepolia.wait();
    console.log("id: ", await sepoliaNotaryContract.lastDepositID());

    const executeBridgeAmoy = await amoyNotaryContract.connect(amoyWallet).executeBridge(11155111, "<amoyAccountAddress>", amount, { gasLimit: 1000000 });
    executeBridgeAmoy.wait();
    console.log("balanceOf: ", await amoyTokenContract.balanceOf("<amoyAccountAddress>"));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });