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
    TOKEN_ADDRESS_AMOY,
    NODE_URL_AVALANCHE,
    AVALANCHE_PRIVATE_KEY01,
    NOTARY_ADDRESS_AVALANCHE,
    TOKEN_ADDRESS_AVALANCHE
} = process.env;

const sepoliaProvider = new ethers.JsonRpcProvider(NODE_URL_SEPOLIA, { chainId: 11155111, name: 'sepolia' });
const amoyProvider = new ethers.JsonRpcProvider(NODE_URL_AMOY, { chainId: 137, name: 'amoy' });
const avalancheProvider = new ethers.JsonRpcProvider(NODE_URL_AVALANCHE, { chainId: 43114, name: 'avalanche' });

const sepoliaWallet = new ethers.Wallet(SEPOLIA_PRIVATE_KEY01, sepoliaProvider);
const amoyWallet = new ethers.Wallet(AMOY_PRIVATE_KEY01, amoyProvider);
const avalancheWallet = new ethers.Wallet(AVALANCHE_PRIVATE_KEY01, avalancheProvider);

const tokenAddressSepolia = TOKEN_ADDRESS_SEPOLIA;
const notaryAddressSepolia = NOTARY_ADDRESS_SEPOLIA;

const tokenAddressAmoy = TOKEN_ADDRESS_AMOY;
const notaryAddressAmoy = NOTARY_ADDRESS_AMOY;

const tokenAddressAvalanche = TOKEN_ADDRESS_AVALANCHE;
const notaryAddressAvalanche = NOTARY_ADDRESS_AVALANCHE;

async function main() {
    const sepoliaTokenContract = new ethers.Contract(tokenAddressSepolia, TokenABI.abi, sepoliaWallet);
    const sepoliaNotaryContract = new ethers.Contract(notaryAddressSepolia, NotaryABI.abi, sepoliaWallet);

    const amoyTokenContract = new ethers.Contract(tokenAddressAmoy, TokenABI.abi, amoyWallet);
    const amoyNotaryContract = new ethers.Contract(notaryAddressAmoy, NotaryABI.abi, amoyWallet);

    const avalancheTokenContract = new ethers.Contract(tokenAddressAvalanche, TokenABI.abi, avalancheWallet);
    const avalancheNotaryContract = new ethers.Contract(notaryAddressAvalanche, NotaryABI.abi, avalancheWallet);

    const amount = ethers.parseEther('100');

    // console.log(`\n--- Operações Sepolia (Stake) ---`);
    // console.log(`Aprovando ${ethers.formatEther(amount)} tokens na Sepolia para o contrato Notary (${notaryAddressSepolia})...`);
    // const aproveSepoliaTx = await sepoliaTokenContract.connect(sepoliaWallet).approve(notaryAddressSepolia, amount);
    // await aproveSepoliaTx.wait(); 
    // console.log(`Tokens aprovados na Sepolia. Transação: ${aproveSepoliaTx.hash}`);

    // console.log(`Realizando stake de ${ethers.formatEther(amount)} tokens na Sepolia...`);
    // const stakeSepoliaTx = await sepoliaNotaryContract.connect(sepoliaWallet).stake(amount,
    //     {
    //         gasLimit: 1000000, 
    //         maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei'), 
    //         maxFeePerGas: ethers.parseUnits('50', 'gwei')           
    //     }
    // );
    // await stakeSepoliaTx.wait();
    // console.log(`Stake realizado na Sepolia. Transação: ${stakeSepoliaTx.hash}`);

    // console.log(`Allowance do Notary na Sepolia para ${sepoliaWallet.address}: ${ethers.formatEther(await sepoliaTokenContract.allowance(sepoliaWallet.address, notaryAddressSepolia))} tokens`);
    // console.log(`Balanço do contrato Notary na Sepolia: ${ethers.formatEther(await sepoliaTokenContract.balanceOf(notaryAddressSepolia))} tokens`);


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

    // console.log('\n--- Operação Fuji (Stake)');
    // console.log(`Aprovando ${ethers.formatEther(amount)} tokens na Fuji para o contrato Notary (${notaryAddressAvalanche})...`);
    // const aproveAvalancheTx = await avalancheTokenContract.connect(avalancheWallet).approve(notaryAddressAvalanche, amount,
    //     {
    //         gasLimit: 1000000,
    //         maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei'),
    //         maxFeePerGas: ethers.parseUnits('50', 'gwei')
    //     }
    // );
    // await aproveAvalancheTx.wait();
    // console.log(`Tokens aprovados na Fuji. Transação: ${aproveAvalancheTx.hash}`);

    // console.log(`Realizando stake de ${ethers.formatEther(amount)} tokens na Fuji...`);
    // const stakeAvalancheTx = await avalancheNotaryContract.connect(avalancheWallet).stake(amount,
    //     {
    //         gasLimit: 1000000,
    //         maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei'),
    //         maxFeePerGas: ethers.parseUnits('50', 'gwei')
    //     }
    // );
    // await stakeAvalancheTx.wait();
    // console.log(`Stake realizado na Fuji. Transação: ${stakeAvalancheTx.hash}`);

    // console.log(`Allowance do Notary na Fuji para ${avalancheWallet.address}: ${ethers.formatEther(await avalancheTokenContract.allowance(avalancheWallet.address, notaryAddressAvalanche))} tokens`);
    // console.log(`Balanço do contrato Notary na Fuji: ${ethers.formatEther(await avalancheTokenContract.balanceOf(notaryAddressAvalanche))} tokens`);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Ocorreu um erro durante a execução do script:");
        console.error(error);
        process.exit(1);
    });