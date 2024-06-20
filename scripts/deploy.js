require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

async function main() {
    const networkName = hre.network.name;
    const chainIdHex = await hre.network.provider.send("eth_chainId");
    const chainIdDec = parseInt(chainIdHex, 16);
    let holders;
    console.log(`Network: ${networkName} | ChainId: (${chainIdDec})`);

    if(chainIdDec == 11155111){
        console.log("Deploying on SEPOLIA:");
        // holders = [privateKey1, privateKey2, privateKey3]; // Add your private keys here
    }else if(chainIdDec == 80002){
        console.log("Deploying on AMOY:");
        // holders = [privateKey1, privateKey2, privateKey3]; // Add your private keys here

    }else{
        throw new Error("Please indicate your network! (sepolia or amoy)");
    }

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(holders);
    console.log("Tokens address: ", token.address);

    const Notary = await ethers.getContractFactory("Notary");
    const notary = await Notary.deploy(token.address);
    console.log("Notary address: ", notary.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });