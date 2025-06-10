// scripts/transactionSepoliaToAmoy.js

require("dotenv").config();
const { ethers } = require("hardhat"); 

// ABIs dos contratos.
const NotaryABI = require("../artifacts/contracts/Notary.sol/Notary.json");
const TokenABI = require("../artifacts/contracts/Token.sol/Token.json");

const {
    NODE_URL_SEPOLIA,
    NODE_URL_AMOY,
    SEPOLIA_PRIVATE_KEY01, // Carteira para depositar na Sepolia (e aprovar)
    AMOY_PRIVATE_KEY01,    // Carteira para receber na Amoy (e talvez executar a ponte)
    NOTARY_ADDRESS_SEPOLIA,
    TOKEN_ADDRESS_SEPOLIA,
    NOTARY_ADDRESS_AMOY,
    TOKEN_ADDRESS_AMOY
} = process.env;

async function main() {
    const tokenAddressSepolia = TOKEN_ADDRESS_SEPOLIA;
    const notaryAddressSepolia = NOTARY_ADDRESS_SEPOLIA;
    
    const tokenAddressAmoy = TOKEN_ADDRESS_AMOY;
    const notaryAddressAmoy = NOTARY_ADDRESS_AMOY; 

    // Provedores (ethers.js v6)
    const sepoliaProvider = new ethers.JsonRpcProvider(
        NODE_URL_SEPOLIA,
        { chainId: 11155111, name: 'sepolia' } 
    );
    const amoyProvider = new ethers.JsonRpcProvider(
        NODE_URL_AMOY,
        { chainId: 80002, name: 'amoy' } 
    );

    // Wallets: sepoliaWallet será o remetente do depósito, amoyWallet o recebedor
    const sepoliaWallet = new ethers.Wallet(SEPOLIA_PRIVATE_KEY01, sepoliaProvider);
    const amoyWallet = new ethers.Wallet(AMOY_PRIVATE_KEY01, amoyProvider); // Pode ser a mesma wallet que executa a ponte

    console.log(`\n--- Transação Sepolia para Amoy ---`);
    console.log(`Carteira Sepolia (Depositante): ${sepoliaWallet.address}`);
    console.log(`Carteira Amoy (Recebedor/Executor): ${amoyWallet.address}`);

    // Instanciação dos Contratos
    const sepoliaTokenContract = new ethers.Contract(tokenAddressSepolia, TokenABI.abi, sepoliaWallet);
    const sepoliaNotaryContract = new ethers.Contract(notaryAddressSepolia, NotaryABI.abi, sepoliaWallet);
    const amoyTokenContract = new ethers.Contract(tokenAddressAmoy, TokenABI.abi, amoyWallet);
    const amoyNotaryContract = new ethers.Contract(notaryAddressAmoy, NotaryABI.abi, amoyWallet);

    const amount = ethers.parseEther('1'); // 1 token para a transação
    // ENDEREÇO ALTERADO AQUI: Agora ele pega o endereço da amoyWallet
    const amoyRecipientAddress = amoyWallet.address; 

    // --- Aprovação na Sepolia ---
    console.log(`\n--- Sepolia (Aprovação e Depósito) ---`);
    console.log(`Aprovando ${ethers.formatEther(amount)} tokens na Sepolia para o contrato Notary (${notaryAddressSepolia})...`);
    const approveSepoliaTx = await sepoliaTokenContract.connect(sepoliaWallet).approve(notaryAddressSepolia, amount, {
        maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei'),
        maxFeePerGas: ethers.parseUnits('50', 'gwei')
    });
    await approveSepoliaTx.wait(); 
    console.log(`Tokens aprovados na Sepolia. Transação: ${approveSepoliaTx.hash}`);

    // --- Depósito na Sepolia ---
    console.log(`Depositando ${ethers.formatEther(amount)} tokens no Notary da Sepolia para ${amoyRecipientAddress} na Amoy...`);
    const depositSepoliaTx = await sepoliaNotaryContract.connect(sepoliaWallet).deposit(amount, amoyRecipientAddress, {
        gasLimit: 1000000,
        maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei'),
        maxFeePerGas: ethers.parseUnits('50', 'gwei')
    });
    await depositSepoliaTx.wait(); 
    console.log(`Depósito realizado na Sepolia. Transação: ${depositSepoliaTx.hash}`);
    const lastDepositIdSepolia = await sepoliaNotaryContract.lastDepositID();
    console.log(`Último ID de Depósito na Sepolia: ${lastDepositIdSepolia.toString()}`); 

    // --- Executar Ponte na Amoy ---
    const depositIdToBridge = lastDepositIdSepolia; 
    
    console.log(`\n--- Amoy (Executar Ponte) ---`);
    console.log(`Executando ponte na Amoy com ID de Depósito ${depositIdToBridge.toString()} para ${amoyRecipientAddress}...`);
    const executeBridgeAmoyTx = await amoyNotaryContract.connect(amoyWallet).executeBridge(depositIdToBridge, amoyRecipientAddress, amount, {
        gasLimit: 1000000,
        maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei'),
        maxFeePerGas: ethers.parseUnits('50', 'gwei')
    });
    await executeBridgeAmoyTx.wait(); 
    console.log(`Ponte executada na Amoy. Transação: ${executeBridgeAmoyTx.hash}`);

    // --- Verificação Final ---
    const finalBalanceAmoy = await amoyTokenContract.balanceOf(amoyRecipientAddress);
    console.log(`Balanço final de tokens em ${amoyRecipientAddress} na Amoy: ${ethers.formatEther(finalBalanceAmoy)} tokens`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Um erro ocorreu durante a execução do script:");
        console.error(error);
        process.exit(1);
    });