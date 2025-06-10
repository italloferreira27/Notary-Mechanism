require("dotenv").config();

const { ethers } = require("hardhat");

const NotaryABI = require("../artifacts/contracts/Notary.sol/Notary.json");
const TokenABI = require("../artifacts/contracts/Token.sol/Token.json");

const {
    NODE_URL_SEPOLIA,
    NODE_URL_AMOY,
    SEPOLIA_PRIVATE_KEY01,
    AMOY_PRIVATE_KEY01,
    NOTARY_ADDRESS_SEPOLIA,
    TOKEN_ADDRESS_SEPOLIA,
    NOTARY_ADDRESS_AMOY,
    TOKEN_ADDRESS_AMOY
} = process.env;

const sepoliaProvider = new ethers.JsonRpcProvider(NODE_URL_SEPOLIA, { chainId: 11155111, name: 'sepolia' });
const amoyProvider = new ethers.JsonRpcProvider(NODE_URL_AMOY, { chainId: 80002, name: 'amoy' });

const sepoliaWallet = new ethers.Wallet(SEPOLIA_PRIVATE_KEY01, sepoliaProvider);
const amoyWallet = new ethers.Wallet(AMOY_PRIVATE_KEY01, amoyProvider);

const tokenAddressSepolia = TOKEN_ADDRESS_SEPOLIA;
const notaryAddressSepolia = NOTARY_ADDRESS_SEPOLIA;

const tokenAddressAmoy = TOKEN_ADDRESS_AMOY;
const notaryAddressAmoy = NOTARY_ADDRESS_AMOY;

async function main() {
    const sepoliaTokenContract = new ethers.Contract(tokenAddressSepolia, TokenABI.abi, sepoliaWallet);
    const sepoliaNotaryContract = new ethers.Contract(notaryAddressSepolia, NotaryABI.abi, sepoliaWallet);
    const amoyTokenContract = new ethers.Contract(tokenAddressAmoy, TokenABI.abi, amoyWallet);
    const amoyNotaryContract = new ethers.Contract(notaryAddressAmoy, NotaryABI.abi, amoyWallet);
    
    const amount = ethers.parseEther('100');
    
    console.log(`\n--- Operações Sepolia (Stake) ---`);
    console.log(`Aprovando ${ethers.formatEther(amount)} tokens na Sepolia para o contrato Notary (${notaryAddressSepolia})...`);
    const aproveSepoliaTx = await sepoliaTokenContract.connect(sepoliaWallet).approve(notaryAddressSepolia, amount);
    await aproveSepoliaTx.wait(); 
    console.log(`Tokens aprovados na Sepolia. Transação: ${aproveSepoliaTx.hash}`);

    console.log(`Realizando stake de ${ethers.formatEther(amount)} tokens na Sepolia...`);
    const stakeSepoliaTx = await sepoliaNotaryContract.connect(sepoliaWallet).stake(amount,
        {
            gasLimit: 1000000, 
            maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei'), 
            maxFeePerGas: ethers.parseUnits('50', 'gwei')           
        }
    );
    await stakeSepoliaTx.wait();
    console.log(`Stake realizado na Sepolia. Transação: ${stakeSepoliaTx.hash}`);

    console.log(`Allowance do Notary na Sepolia para ${sepoliaWallet.address}: ${ethers.formatEther(await sepoliaTokenContract.allowance(sepoliaWallet.address, notaryAddressSepolia))} tokens`);
    console.log(`Balanço do contrato Notary na Sepolia: ${ethers.formatEther(await sepoliaTokenContract.balanceOf(notaryAddressSepolia))} tokens`);


    console.log(`\n--- Operações Amoy (Stake) ---`);
    console.log(`Aprovando ${ethers.formatEther(amount)} tokens na Amoy para o contrato Notary (${notaryAddressAmoy})...`);
    const aproveAmoyTx = await amoyTokenContract.connect(amoyWallet).approve(notaryAddressAmoy, amount,
        {
            gasLimit: 1000000, 
            maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei'), 
            maxFeePerGas: ethers.parseUnits('50', 'gwei')           
        }
    );
    await aproveAmoyTx.wait();
    console.log(`Tokens aprovados na Amoy. Transação: ${aproveAmoyTx.hash}`);

    console.log(`Realizando stake de ${ethers.formatEther(amount)} tokens na Amoy...`);
    const stakeAmoyTx = await amoyNotaryContract.connect(amoyWallet).stake(amount,
        {
            gasLimit: 1000000, 
            maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei'), 
            maxFeePerGas: ethers.parseUnits('50', 'gwei')           
        }
    );
    await stakeAmoyTx.wait();
    console.log(`Stake realizado na Amoy. Transação: ${stakeAmoyTx.hash}`);

    console.log(`Allowance do Notary na Amoy para ${amoyWallet.address}: ${ethers.formatEther(await amoyTokenContract.allowance(amoyWallet.address, notaryAddressAmoy))} tokens`);
    console.log(`Balanço do contrato Notary na Amoy: ${ethers.formatEther(await amoyTokenContract.balanceOf(notaryAddressAmoy))} tokens`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Ocorreu um erro durante a execução do script:");
        console.error(error);
        process.exit(1);
    });