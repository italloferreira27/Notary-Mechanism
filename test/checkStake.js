require("dotenv").config();
const { ethers } = require("hardhat");

const NotaryABI = require("../artifacts/contracts/Notary.sol/Notary.json");

const { NODE_URL_AVALANCHE, NODE_URL_AMOY, AVALANCHE_PRIVATE_KEY01, AVALANCHE_PRIVATE_KEY02, AMOY_PRIVATE_KEY01, AMOY_PRIVATE_KEY02 } = process.env;
const { NOTARY_ADDRESS_AVALANCHE, NOTARY_ADDRESS_AMOY } = process.env;

async function main() {


    // const notaryAddressAmoy = NOTARY_ADDRESS_AMOY;
    // const amoyProvider = new ethers.JsonRpcProvider(NODE_URL_AMOY);
    // const amoyWallet = new ethers.Wallet(AMOY_PRIVATE_KEY01, amoyProvider);
    // const amoyNotaryContract = new ethers.Contract(notaryAddressAmoy, NotaryABI.abi, amoyWallet);

    // const stake = await amoyNotaryContract.stakes(amoyWallet.address);
    // console.log(`Stake of ${amoyWallet.address} on Amoy: ${ethers.formatEther(stake)} tokens`);


    const notaryAddressAvalanche = NOTARY_ADDRESS_AVALANCHE;
    const senderAddress = "0x9A30D453697a55d810A51425137A9F0Bb0f63F76"; // From error log

    // Connect to Fuji
    const provider = new ethers.JsonRpcProvider(NODE_URL_AVALANCHE);
    const notaryContract = new ethers.Contract(notaryAddressAvalanche, NotaryABI.abi, provider);

    console.log(`Checking stake for ${senderAddress} on Notary ${notaryAddressAvalanche}`);

    try {
        const stake = await notaryContract.stakes(senderAddress);
        console.log(`Stake: ${ethers.formatEther(stake)} ETH`);

        if (stake == 0n) {
            console.log("ERROR: Stake is 0. The sender is not a bridge node.");
        } else {
            console.log("Sender has stake.");
        }
    } catch (error) {
        console.error("Error fetching stake:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
