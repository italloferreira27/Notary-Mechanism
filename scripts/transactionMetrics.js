const fs = require('fs');
require("dotenv").config();
const { ethers } = require("hardhat");
const axios = require('axios');


const NotaryABI = require("../artifacts/contracts/Notary.sol/Notary.json");
const TokenABI = require("../artifacts/contracts/Token.sol/Token.json");

const { NODE_URL_AVALANCHE, NODE_URL_AMOY, AVALANCHE_PRIVATE_KEY01, AVALANCHE_PRIVATE_KEY02, AMOY_PRIVATE_KEY01, AMOY_PRIVATE_KEY02 } = process.env;

async function getCryptoPrice(cryptoId) {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`);
        const price = response.data[cryptoId].usd;
        return price;
    } catch (error) {
        console.error(`Erro ao buscar o preço de ${cryptoId}:`, error);
        return null;
    }
}

// async function getPolygonGasConfig(provider) {
//     try {
//         // Tenta pegar da API oficial da Polygon (Gas Station) para precisão máxima
//         // A opção 'rapid' garante que entre no próximo bloco
//         const response = await axios.get('https://gasstation.polygon.technology/v2');
//         const data = response.data.estimatedBaseFees;
        
//         // A API retorna em Gwei, precisamos converter.
//         // Pegamos o valor 'rapid' e adicionamos +10% de segurança
//         const maxPriorityFee = ethers.parseUnits(Math.ceil(data.rapid).toString(), 'gwei');
//         const maxFee = ethers.parseUnits(Math.ceil(data.rapid * 1.5).toString(), 'gwei'); // Base * 1.5

//         console.log(`⚡ Gas Station: Priority ${data.rapid} Gwei`);
        
//         return {
//             maxPriorityFeePerGas: maxPriorityFee,
//             maxFeePerGas: maxFee,
//             gasLimit: 1500000 // Limite um pouco maior para evitar "Out of Gas"
//         };
//     } catch (error) {
//         console.log("⚠️ Falha na Gas Station, usando fallback do Provider com multiplicador 2x...");
        
//         // Fallback: Pega do provider e duplica os valores para garantir mineração
//         const feeData = await provider.getFeeData();
        
//         // Multiplicadores agressivos (BigInt)
//         const priorityMultiplier = 150n; // +50%
//         const baseMultiplier = 200n; // +100%

//         const maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas * priorityMultiplier) / 100n;
//         const maxFeePerGas = (feeData.maxFeePerGas * baseMultiplier) / 100n;

//         return {
//             maxPriorityFeePerGas,
//             maxFeePerGas,
//             gasLimit: 1500000
//         };
//     }
// }

async function main() {
    const {
        TOKEN_ADDRESS_AVALANCHE,
        NOTARY_ADDRESS_AVALANCHE,
        TOKEN_ADDRESS_AMOY,
        NOTARY_ADDRESS_AMOY
    } = process.env;

    const tokenAddressAvalanche = TOKEN_ADDRESS_AVALANCHE;
    const notaryAddressAvalanche = NOTARY_ADDRESS_AVALANCHE;

    const tokenAddressAmoy = TOKEN_ADDRESS_AMOY;
    const notaryAddressAmoy = NOTARY_ADDRESS_AMOY;

    const avalancheProvider = new ethers.JsonRpcProvider(NODE_URL_AVALANCHE);
    const amoyProvider = new ethers.JsonRpcProvider(NODE_URL_AMOY);

    const avalancheWallet = new ethers.Wallet(AVALANCHE_PRIVATE_KEY01, avalancheProvider);
    const amoyWallet = new ethers.Wallet(AMOY_PRIVATE_KEY01, amoyProvider);

    const avalancheTokenContract = new ethers.Contract(tokenAddressAvalanche, TokenABI.abi, avalancheWallet);
    const avalancheNotaryContract = new ethers.Contract(notaryAddressAvalanche, NotaryABI.abi, avalancheWallet);
    const amoyTokenContract = new ethers.Contract(tokenAddressAmoy, TokenABI.abi, amoyWallet);
    const amoyNotaryContract = new ethers.Contract(notaryAddressAmoy, NotaryABI.abi, amoyWallet);

    const networkName = hre.network.name;
    const chainIdHex = await hre.network.provider.send("eth_chainId");
    const chainIdDec = parseInt(chainIdHex, 16);
    console.log(`Network: ${networkName} | ChainId: (${chainIdDec})`);

    if (chainIdDec == 43114) { // mainnet avalanche
        console.log("Avalanche -> Amoy");
        const amount = ethers.parseEther('1');
        const fullTimeStart = Date.now();

        const timeAproveAvalancheStart = Date.now();
        const approveAvalanche = await avalancheTokenContract.connect(avalancheWallet).approve(
            avalancheNotaryContract.target,
            amount,
            { gasLimit: 1000000, maxFeePerGas: ethers.parseUnits('30', 'gwei'), maxPriorityFeePerGas: ethers.parseUnits('1.5', 'gwei') }
        );

        const receiptAvalancheApprove = await approveAvalanche.wait();
        const gasUsedApproveAvalanche = receiptAvalancheApprove.gasUsed;
        const timeAproveAvalancheEnd = Date.now();
        const timeAproveAvalanche = (timeAproveAvalancheEnd - timeAproveAvalancheStart);

        console.log('Approve Avalanche: ', timeAproveAvalanche, 'ms');

        const publicKeyAmoy02 = ethers.computeAddress(AMOY_PRIVATE_KEY02);

        const timeDepositAvalancheStart = Date.now();
        const depositAvalanche = await avalancheNotaryContract.connect(avalancheWallet).deposit(
            amount,
            publicKeyAmoy02,
            { gasLimit: 1000000, maxFeePerGas: ethers.parseUnits('30', 'gwei'), maxPriorityFeePerGas: ethers.parseUnits('1.5', 'gwei') }
        );
        const receiptDepositAvalanche = await depositAvalanche.wait();
        const gasUsedDepositAvalanche = receiptDepositAvalanche.gasUsed;
        const timeDepositAvalancheEnd = Date.now();
        const timeDepositAvalanche = (timeDepositAvalancheEnd - timeDepositAvalancheStart);

        console.log('Deposit Avalanche: ', timeDepositAvalanche, 'ms');

        const id = await avalancheNotaryContract.lastDepositID();
        console.log("ID último depósito: ", id.toString());

        const timeExecuteBridgeAmoyStart = Date.now();
        const executeBridgeAmoy = await amoyNotaryContract.connect(amoyWallet).executeBridge(
            id,
            publicKeyAmoy02,
            amount,
            {
                gasLimit: 2000000,
                maxFeePerGas: ethers.parseUnits('600', 'gwei'),
                maxPriorityFeePerGas: ethers.parseUnits('70', 'gwei')
            }
        );
        const receiptExecuteBridgeAmoy = await executeBridgeAmoy.wait();
        const gasUsedExecuteBridgeAmoy = receiptExecuteBridgeAmoy.gasUsed;
        const timeExecuteBridgeAmoyEnd = Date.now();
        const timeExecuteBridgeAmoy = (timeExecuteBridgeAmoyEnd - timeExecuteBridgeAmoyStart);

        console.log("BalanceOf: ", await amoyTokenContract.balanceOf(publicKeyAmoy02));

        const fullTimeEnd = Date.now();
        const fullTime = (fullTimeEnd - fullTimeStart);
        console.log("Full Time: ", fullTime, "ms");

        const gasPriceAmoy = (await amoyProvider.getFeeData()).gasPrice;
        const gasPriceAvalanche = (await avalancheProvider.getFeeData()).gasPrice;

        // Data
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        const date = today.toISOString();
        console.log("\nDate: ", date);

        // Preço
        const cryptoId = 'avalanche-2';   // Avalanche
        const cryptoId2 = 'polygon-ecosystem-token';  // Amoy
        const priceAvalanche = await getCryptoPrice(cryptoId);
        const priceAmoy = await getCryptoPrice(cryptoId2);

        if (priceAvalanche !== null || priceAmoy !== null) {
            console.log(`Preço atual de ${cryptoId} em USD: $${priceAvalanche}`);
            console.log(`Preço atual de ${cryptoId2} em USD: $${priceAmoy}`);
        }

        const csvData = [
            [date, gasUsedApproveAvalanche.toString(), gasUsedDepositAvalanche.toString(), gasUsedExecuteBridgeAmoy.toString(), timeAproveAvalanche, timeDepositAvalanche, timeExecuteBridgeAmoy, priceAvalanche, priceAmoy, fullTime, gasPriceAvalanche.toString(), gasPriceAmoy.toString()]
        ];

        const csvContent = csvData.map(e => e.join(",")).join("\n");

        if (!fs.existsSync('./metrics/transactionAvalanche_Amoy.csv')) {
            const headers = 'date,gasUsedApproveAvalanche,gasUsedDepositAvalanche,gasUsedExecuteBridgeAmoy,timeAproveAvalanche,timeDepositAvalanche,timeExecuteBridgeAmoy,priceAvalanche,priceAmoy,full Time(ms),gasPriceAvalanche,gasPriceAmoy\n';
            fs.appendFileSync('./metrics/transactionAvalanche_Amoy.csv', headers);
        }

        // Append the CSV data to the file
        fs.appendFileSync('./metrics/transactionAvalanche_Amoy.csv', csvContent + '\n', (err) => {
            if (err) {
                console.error('Error writing to file', err);
            } else {
                console.log('Data successfully appended to CSV file!');
            }
        });
    } else if (chainIdDec == 137) { // polygon Chain ID
        console.log("Amoy -> Fuji");

        // const gasConfig = {
        //     maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"), // Ajuste conforme a rede
        //     maxFeePerGas: ethers.parseUnits("60", "gwei"), // Ajuste conforme a rede
        //     gasLimit: 1000000
        // };

        const gasConfig = {
            gasLimit: 2000000,
            maxFeePerGas: ethers.parseUnits('600', 'gwei'),
            maxPriorityFeePerGas: ethers.parseUnits('70', 'gwei')
        };

        // const gasConfig = await getPolygonGasConfig(amoyProvider);

        // console.log("Gas Config: ", gasConfig);

        const amount = ethers.parseEther('1');
        const fullTimeStart = Date.now();

        const balance = await amoyProvider.getBalance(amoyWallet.address);
        const valorSaldo = ethers.formatEther(balance);

        console.log("Get balance polygon: ", valorSaldo);

        const timeAproveAmoyStart = Date.now();
        const aproveAmoy = await amoyTokenContract.connect(amoyWallet).approve(
            amoyNotaryContract.target,
            amount,
            gasConfig
        );
        const receiptAmoyAprove = await aproveAmoy.wait();
        const gasUsedApproveAmoy = receiptAmoyAprove.gasUsed;
        const timeAproveAmoyEnd = Date.now();
        const timeAproveAmoy = (timeAproveAmoyEnd - timeAproveAmoyStart);

        const publicKeyAvax02 = ethers.computeAddress(AVALANCHE_PRIVATE_KEY02);

        const timeDepositAmoyStart = Date.now();
        const depositAmoy = await amoyNotaryContract.connect(amoyWallet).deposit(
            amount,
            publicKeyAvax02,
            gasConfig
        );
        const receiptDepositAmoy = await depositAmoy.wait();
        const gasUsedDepositAmoy = receiptDepositAmoy.gasUsed;
        const timeDepositAmoyEnd = Date.now();
        const timeDepositAmoy = (timeDepositAmoyEnd - timeDepositAmoyStart);

        const id = await amoyNotaryContract.lastDepositID();
        console.log("id last deposit: ", id.toString());

        const timeExecuteBridgeAvalancheStart = Date.now();
        const executeBridgeAvax = await avalancheNotaryContract.connect(avalancheWallet).executeBridge(
            id,
            publicKeyAvax02,
            amount,
            {
                gasLimit: 1000000,
                maxFeePerGas: ethers.parseUnits('30', 'gwei'),
                maxPriorityFeePerGas: ethers.parseUnits('5', 'gwei')
            }
        );
        const receiptExecuteBridgeAvax = await executeBridgeAvax.wait();
        const gasUsedExecuteBridgeAvalanche = receiptExecuteBridgeAvax.gasUsed;
        const timeExecuteBridgeAvalancheEnd = Date.now();
        const timeExecuteBridgeAvalanche = (timeExecuteBridgeAvalancheEnd - timeExecuteBridgeAvalancheStart);

        console.log("balanceOf: ", await avalancheTokenContract.balanceOf(publicKeyAvax02));

        const fullTimeEnd = Date.now();
        const fullTime = (fullTimeEnd - fullTimeStart);
        console.log("Full Time: ", fullTime, "ms");

        const gasPriceAmoy = (await amoyProvider.getFeeData()).gasPrice;
        const gasPriceAvax = (await avalancheProvider.getFeeData()).gasPrice;

        // date
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        const date = today.toISOString();
        console.log("\nDate: ", date);

        // price
        const cryptoId = 'avalanche-2';   // Avalanche
        const cryptoId2 = 'polygon-ecosystem-token';  // Amoy
        const priceAvax = await getCryptoPrice(cryptoId);
        const priceAmoy = await getCryptoPrice(cryptoId2);

        if (priceAmoy !== null || priceAvax !== null) {
            console.log(`Preço atual de ${cryptoId} em USD: $${priceAvax}`);
            console.log(`Preço atual de ${cryptoId2} em USD: $${priceAmoy}`);
        }

        const csvData = [
            [date, gasUsedApproveAmoy.toString(), gasUsedDepositAmoy.toString(), gasUsedExecuteBridgeAvalanche.toString(), timeAproveAmoy, timeDepositAmoy, timeExecuteBridgeAvalanche, priceAmoy, priceAvax, fullTime, gasPriceAmoy.toString(), gasPriceAvax.toString()]
        ];

        // Convert array to CSV string
        const csvContent = csvData.map(e => e.join(",")).join("\n");

        // Check if the file already exists, if not, add headers
        if (!fs.existsSync('./metrics/transactionAmoy_Avalanche.csv')) {
            const headers = 'date,gasUsedApproveAmoy,gasUsedDepositAmoy,gasUsedExecuteBridgeAvalanche,timeAproveAmoy,timeDepositAmoy,timeExecuteBridgeAvalanche,priceAmoy,priceAvax(USD),full Time(ms),gasPriceAmoy,gasPriceAvax\n';
            fs.appendFileSync('./metrics/transactionAmoy_Avalanche.csv', headers);
        }

        // Append the CSV data to the file
        fs.appendFileSync('./metrics/transactionAmoy_Avalanche.csv', csvContent + '\n', (err) => {
            if (err) {
                console.error('Error writing to file', err);
            } else {
                console.log('Data successfully appended to CSV file!');
            }
        });
    }    
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });