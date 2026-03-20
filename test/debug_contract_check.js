
require("dotenv").config();
const { ethers } = require("hardhat");

const {
    NODE_URL_AVALANCHE,
    NODE_URL_AMOY,
    NOTARY_ADDRESS_AVALANCHE,
    NOTARY_ADDRESS_AMOY
} = process.env;

async function main() {
    console.log("Checking Avalanche Notary (from env) at:", NOTARY_ADDRESS_AVALANCHE);
    if (!NOTARY_ADDRESS_AVALANCHE) {
        console.error("ERROR: NOTARY_ADDRESS_AVALANCHE is not defined in .env");
    } else {
        const avalancheProvider = new ethers.JsonRpcProvider(NODE_URL_AVALANCHE);
        const codeAvalanche = await avalancheProvider.getCode(NOTARY_ADDRESS_AVALANCHE);
        console.log("Avalanche Code Length:", codeAvalanche.length);
        if (codeAvalanche === "0x") {
            console.error("ERROR: No code found at Avalanche Notary address!");
        } else {
            console.log("Success: Code found at Avalanche Notary address.");
        }
    }

    console.log("\nChecking Amoy Notary (from env) at:", NOTARY_ADDRESS_AMOY);
    if (!NOTARY_ADDRESS_AMOY) {
        console.error("ERROR: NOTARY_ADDRESS_AMOY is not defined in .env");
    } else {
        const amoyProvider = new ethers.JsonRpcProvider(NODE_URL_AMOY);
        const codeAmoy = await amoyProvider.getCode(NOTARY_ADDRESS_AMOY);
        console.log("Amoy Code Length:", codeAmoy.length);
        if (codeAmoy === "0x") {
            console.error("ERROR: No code found at Amoy Notary address!");
        } else {
            console.log("Success: Code found at Amoy Notary address.");
        }
    }
}

main().catch(console.error);
