require('dotenv').config();
const { ethers } = require("ethers");

// Resgatando as variáveis do .env
const { 
    AVALANCHE_PRIVATE_KEY01, 
    AVALANCHE_PRIVATE_KEY02, 
    AMOY_PRIVATE_KEY01, 
    AMOY_PRIVATE_KEY02 
} = process.env;

// Função auxiliar para gerar e mostrar o endereço
const mostrarEndereco = (nomeRede, nomeConta, privateKey) => {
    if (!privateKey) {
        console.error(`[❌] Erro: Private Key para ${nomeRede} (${nomeConta}) não encontrada no .env`);
        return;
    }

    try {
        // Cria uma instância de carteira a partir da chave privada
        const wallet = new ethers.Wallet(privateKey);
        console.log(`[✅] ${nomeRede} - ${nomeConta}:`);
        console.log(`     Endereço: ${wallet.address}`);
    } catch (error) {
        console.error(`[❌] Erro ao processar chave de ${nomeRede} (${nomeConta}): ${error.message}`);
    }
};

console.log("--- Gerando Endereços Públicos ---\n");

// Avalanche Fuji
mostrarEndereco("Avalanche Fuji", "Conta 01", AVALANCHE_PRIVATE_KEY01);
mostrarEndereco("Avalanche Fuji", "Conta 02", AVALANCHE_PRIVATE_KEY02);

console.log("----------------------------------");

// Polygon Amoy
mostrarEndereco("Polygon Amoy", "Conta 01", AMOY_PRIVATE_KEY01);
mostrarEndereco("Polygon Amoy", "Conta 02", AMOY_PRIVATE_KEY02);