# Notary Mechanism
[![NPM](https://img.shields.io/npm/l/react)](https://github.com/italloferreira27/Notary-Mechanism/blob/sepolia-amoy--hardhat/LICENSE) 
## 1\. Visão Geral do Projeto

Este projeto demonstra a implementação de um mecanismo notarial para facilitar a interoperabilidade de Tokens Fungíveis (ERC-20) entre redes blockchain distintas. O escopo atual da implementação abrange as redes de teste **Sepolia (Ethereum)**, **Amoy (Polygon PoS)** e **Fuji (Avalanche C-Chain)**, servindo como uma prova de conceito para a transferência de ativos digitais entre ecossistemas.

## 2\. Fundamentos Teóricos

### 2.1. Interoperabilidade Blockchain
A interoperabilidade blockchain refere-se à capacidade de diferentes redes blockchain comunicarem-se, trocarem dados e ativos de forma eficiente e segura. Este conceito é pivotal para a criação de um ecossistema blockchain mais conectado, superando as barreiras de isolamento inerentes às arquiteturas de blockchain singulares. A implementação de soluções interoperáveis permite que aplicações descentralizadas (dApps) operem de maneira fluida através de múltiplas cadeias, otimizando o uso de recursos e expandindo o universo de possibilidades para finanças descentralizadas (DeFi) e outras aplicações.

### 2.2. Tokens Fungíveis (ERC-20)

Tokens fungíveis, em conformidade com o padrão ERC-20 da Ethereum, representam ativos digitais intercambiáveis, onde cada unidade é idêntica e indistinguível de outra. A interface ERC-20 padroniza funções essenciais como transfer, transferFrom, approve, balanceOf e allowance, garantindo compatibilidade e previsibilidade para contratos inteligentes e aplicações que interagem com esses tokens. Sua adoção disseminada os tornou o pilar para a representação de valor em diversas aplicações financeiras no ecossistema blockchain.

### 2.3. Mecanismo Notarial
O mecanismo notarial, no contexto de bridges inter-cadeias, atua como um sistema de confiança centralizado ou semi-centralizado. Ele emprega um ou mais notários (entidades ou contratos inteligentes) que validam eventos ocorridos em uma cadeia e atestam sua ocorrência para outra cadeia, ou seja, um intermediário confiável que valida e registra transações ou eventos entre diferentes blockchains, permite a realização de transações entre redes distintas, garantindo a integridade e a autenticidade das informações trocadas.

## 3\. Arquitetura e Fluxo Operacional

O sistema Notary Mechanism é composto por um par de contratos inteligentes `Token.sol` (ERC-20) e `Notary.sol` (o contrato da ponte), implantados simetricamente nas redes suportadas (Sepolia, Amoy e Fuji). A comunicação entre as cadeias é mediada por entidades conhecidas como **notários** (ou stakers), que são incentivadas e fiscalizadas pelo próprio mecanismo.

### 3.1. Requisitos e Pré-condições

Para a operação bem-sucedida do sistema, as seguintes pré-condições devem ser satisfeitas:

  * Os contratos `Token.sol` e `Notary.sol` devem estar devidamente implantados em **ambas as redes** de origem e destino.
  * Contas participantes (usuários e notários) devem possuir **fundos de rede (faucet tokens)** para cobrir as taxas de transação (gas fees).
  * Os **notários** devem ter realizado o **stake** de tokens ERC-20 no contrato `Notary.sol` da respectiva cadeia para serem elegíveis a processar transações.

### 3.2. Função do Staker/Notário

Um **notário** é uma entidade (endereço) que se dispõe a mediar transações inter-cadeias. Para se qualificar, um notário deve:

  * **Bloquear ativos (Tokens ERC-20)** em uma espécie de *pool de liquidez* dentro do contrato `Notary.sol` através da função `stake()`.
  * **Receber um incentivo de 5%** do montante transferido para cada transação `executeBridge` bem-sucedida.
  * Estar sujeito a regras de segurança:
      * Um notário não pode executar transferências (`executeBridge`) onde o valor da transação exceda **10% do valor total assegurado** pelo seu stake no contrato. Esta regra visa limitar o potencial de dano em caso de comportamento malicioso, onde, em uma transferência fraudulenta, o notário mal-intencionado roubaria no máximo 10% de seu próprio stake.
      * Existe um mecanismo de **blacklist** onde notários podem ser votados por outros notários. Se a soma dos stakes dos votantes a favor de um banimento exceder 50% do `totalStaked` do contrato, o notário alvo tem seu stake zerado, impedindo-o de atuar como notário.
      * Após executar uma ponte, um notário entra em um **período de bloqueio (`LOCK_PERIOD`)** durante o qual não pode processar novas transações ou realizar unstake, garantindo a disponibilidade dos fundos.

### 3.3. Processo de Interoperabilidade (Deposit & ExecuteBridge)

O fluxo de transferência de tokens entre cadeias é detalhado da seguinte forma:

1.  **Aprovação (Cadeia de Origem):** O usuário A na cadeia de origem (e.g., Sepolia) deve primeiramente **aprovar** que o contrato `Notary.sol` da Sepolia possa gerenciar uma quantidade específica de seus tokens ERC-20, utilizando a função `approve()` do contrato `Token.sol`. Esta etapa é crucial para que o contrato `Notary` possa transferir os tokens em nome do usuário.

2.  **Depósito (Cadeia de Origem):** O usuário A chama a função `deposit(amount, receiver)` no contrato `Notary.sol` da Sepolia.

      * `amount`: A quantidade de tokens a ser transferida.
      * `receiver`: O endereço do usuário B na cadeia de destino (Amoy).
      * O contrato `Notary.sol` na Sepolia executa um `safeTransferFrom()` para mover os tokens da conta do usuário A para o próprio contrato `Notary.sol`.
      * O contrato incrementa um `lastDepositID` e emite um evento `Deposit`, contendo o `depositID`, `sender`, `receiver` (na cadeia de destino) e `amount`.

3.  **Execução da Ponte (Cadeia de Destino):** Um notário ativo (staker) na cadeia de destino (e.g., Amoy) observa o evento `Deposit` emitido na Sepolia. O notário então chama a função `executeBridge(originChainDepositID, receiver, amount)` no contrato `Notary.sol` da Amoy.

      * `originChainDepositID`: O ID do depósito observado na cadeia de origem.
      * `receiver`: O endereço do usuário B na cadeia de destino.
      * `amount`: A quantidade de tokens original do depósito.
      * O contrato `Notary.sol` na Amoy verifica se o `originChainDepositID` já foi executado (`executedDeposits`), se o notário está bloqueado (`lockedUntil`), e se o notário tem stake suficiente para a transação (`NotEnoughStake`).
      * Calcula uma taxa de `BRIDGE_FEE_PERCENTAGE` (5%) sobre o `amount`.
      * Transfere `amountAfterFee` (montante original menos a taxa) para o `receiver` na Amoy.
      * Transfere a `fee` (taxa de 5%) para o `msg.sender` (o notário que executou a ponte) como incentivo.
      * Registra o `originChainDepositID` como executado e atualiza o `lockedUntil` do notário.
      * Emite um evento `ExecuteBridge` na cadeia de destino.

## 4\. Guia de Execução

Este guia detalha os passos para configurar e executar o projeto.

### 4.1. Instalação de Dependências

Certifique-se de ter Node.js e npm instalados. Navegue até a pasta raiz do projeto e execute:

```bash
npm install
```

### 4.2. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e preencha com as variáveis necessárias. Estas variáveis incluem as URLs dos nós RPC das redes (e.g., Alchemy ou Infura) e as chaves privadas das contas que serão utilizadas.

```dotenv
# URLs dos Nós RPC (Substitua por suas chaves de API válidas)
NODE_URL_SEPOLIA="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY_SEPOLIA"
NODE_URL_AMOY="https://polygon-amoy.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY_AMOY"
NODE_URL_AVALANCHE="https://avalanche-fuji.infura.io/v3/YOUR_INFURA_API_KEY_FUJI"

# Chaves Privadas das Contas (Nunca exponha em um repositório público!)
# Certifique-se que estas contas possuem fundos (ETH/MATIC/AVAX) nas respectivas redes de teste
SEPOLIA_PRIVATE_KEY01="sua_chave_privada_sepolia_conta_1"
SEPOLIA_PRIVATE_KEY02="sua_chave_privada_sepolia_conta_2"
AMOY_PRIVATE_KEY01="sua_chave_privada_amoy_conta_1"
AMOY_PRIVATE_KEY02="sua_chave_privada_amoy_conta_2"
AVALANCHE_PRIVATE_KEY01="sua_chave_privada_avalanche_conta_1"
AVALANCHE_PRIVATE_KEY02="sua_chave_privada_avalanche_conta_2"

# Endereços dos Contratos (Serão gerados após o deploy)
# ATUALIZE ESTES VALORES APÓS CADA DEPLOY
TOKEN_ADDRESS_SEPOLIA="0x..."
NOTARY_ADDRESS_SEPOLIA="0x..."
TOKEN_ADDRESS_AMOY="0x..."
NOTARY_ADDRESS_AMOY="0x..."
TOKEN_ADDRESS_AVALANCHE="0x..."
NOTARY_ADDRESS_AVALANCHE="0x..."
```

### 4.3. Implantação dos Contratos (Deploy)

Os contratos `Token.sol` e `Notary.sol` devem ser implantados em ambas as redes.

```bash
# Implantação na Rede Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Implantação na Rede Fuji
npx hardhat run scripts/deploy.js --network fuji

# Implantação na Rede Amoy
npx hardhat run scripts/deploy.js --network amoy
```

**Importante:** Após cada execução bem-sucedida dos comandos de deploy, **atualize os endereços dos contratos** (Token e Notary) em seu arquivo `.env` com os valores exibidos no console.

### 4.4. Registro de Notários (Stake)

Após a implantação, é necessário que um endereço se torne um notário (staker) bloqueando tokens ERC-20 no contrato `Notary.sol` da respectiva rede.

```bash
npx hardhat run scripts/stake.js
```

Este script executa o processo de aprovação e stake nas redes Sepolia e Amoy. Certifique-se de que as contas utilizadas para stake possuem o saldo necessário dos tokens ERC-20 implantados.

### 4.5. Execução da Transação Inter-cadeia

Com os contratos implantados e os notários registrados, a transação inter-cadeia pode ser iniciada. O script `scripts/transactionMetrics.js` gerencia as transações entre as redes configuradas.

#### 4.5.1. Transferência entre Fuji e Amoy

Para transferir de **Fuji para Amoy**:

```bash
npx hardhat run scripts/transactionMetrics.js --network fuji
```

Para transferir de **Amoy para Fuji**:

```bash
npx hardhat run scripts/transactionMetrics.js --network amoy
```

#### 4.5.2. Outras Transferências (Legado)

Os scripts `scripts/transactionSepoliaToAmoy.js` e `scripts/transactionAmoyToSepolia.js` podem ser utilizados para transferências entre Sepolia e Amoy, seguindo a lógica similar.

*   **Sepolia -> Amoy:** `npx hardhat run scripts/transactionSepoliaToAmoy.js`
*   **Amoy -> Sepolia:** `npx hardhat run scripts/transactionAmoyToSepolia.js`



## 5\. Ferramentas e Tecnologias

Este projeto foi desenvolvido utilizando as seguintes ferramentas e bibliotecas:

  * **Hardhat:** Ambiente de desenvolvimento para compilar, implantar, testar e depurar contratos inteligentes.
  * **ethers.js v6:** Biblioteca JavaScript para interagir com a blockchain Ethereum.
  * **Alchemy:** Fornecedor de infraestrutura de nó RPC para acessar as redes de teste Sepolia e Amoy.
  * **Solidity:** Linguagem de programação para contratos inteligentes.
  * **OpenZeppelin Contracts:** Biblioteca de contratos inteligentes seguros e auditados (padrão ERC-20 e utilitários SafeERC20).
  * **dotenv:** Módulo para carregar variáveis de ambiente de um arquivo `.env`.

-----

## 6\. Exemplo Prático de Uso

Para uma demonstração concreta do funcionamento da ponte, os seguintes exemplos de transações e eventos em exploradores de blocos podem ser inspecionados:

  * **Contratos Implantados:**

      * [Token Sepolia](https://sepolia.etherscan.io/address/0x5AAd1957A2E047752cad49cbF4BB14f79Cb9B33E)
      * [Notary Sepolia](https://sepolia.etherscan.io/address/0x24Da0976634b2d296FB1f6012f7C0aBacB50a872)
      * [Token Amoy](https://www.oklink.com/pt-br/amoy/address/0x5fe7cecc95dca0d125b2b354f55efb1502610349)
      * [Notary Amoy](https://www.oklink.com/pt-br/amoy/address/0x03f35734a590d7d92e63e49b94d5609b684ef986)

  * **Fluxo de Transação (Exemplo: 1 Token de Sepolia para Amoy):**

      * **Aprovação do Contrato Notary (Sepolia):** Usuário A autoriza o `Notary.sol` a gerenciar os tokens para a transação.
          * [Visualizar Aprovação (Sepolia Etherscan)](https://sepolia.etherscan.io/tx/0x6d55f7ae513cb92aaf0a17d91ff29ee17100703498c39252edc42e2d85c1ffc5)
      * **Depósito na Cadeia de Origem (Sepolia):** Usuário A deposita 1 token no `Notary.sol` da Sepolia, especificando o destinatário na Amoy.
          * [Visualizar Depósito (Sepolia Etherscan)](https://sepolia.etherscan.io/tx/0xda7fafb1d9271d91a61726b603a124d02462208e450d88df8df96fffb6f0cf21)
          * **Evento `Deposit` (Sepolia):** Emitido pelo contrato, confirmando os detalhes do depósito.
              * [Visualizar Evento de Depósito](https://sepolia.etherscan.io/tx/0xda7fafb1d9271d91a61726b603a124d02462208e450d88df8df96fffb6f0cf21#eventlog)
      * **Execução da Ponte (Amoy):** Um notário executa a transferência para o destinatário na Amoy. Note que o destinatário recebe 0.95 tokens, enquanto 0.05 tokens são direcionados ao notário como incentivo (5% de taxa).
          * [Visualizar Transferência Principal (Oklink Amoy)](https://www.oklink.com/pt-br/amoy/tx/0xe02a3ba6aec93bc1fb6d36d547a9a490795f70a8265274da99fc2bac25702742)
          * [Visualizar Transferências Internas (Oklink Amoy)](https://www.oklink.com/pt-br/amoy/tx/0xe02a3ba6aec93bc1fb6d36d547a9a490795f70a8265274da99fc2bac25702742/transfer)
          * **Evento `ExecuteBridge` (Amoy):** Emitido pelo contrato, confirmando a conclusão da ponte.
              * [Visualizar Evento de Execução de Ponte](https://www.oklink.com/pt-br/amoy/tx/0xe02a3ba6aec93bc1fb6d36d547a9a490795f70a8265274da99fc2bac25702742/log)

-----

## 7\. Referências

  * **ERC-20 Standard:** [OpenZeppelin Contracts - ERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC20)
  * **Implementação Base:** [kitanovicd/Bridge](https://github.com/kitanovicd/Bridge)
  * **Hardhat Documentation:** [Hardhat.org](https://hardhat.org/)
  * **Alchemy Documentation:** [Alchemy.com](https://www.alchemy.com/)
  * **Ethers.js Documentation:** [Ethers.js](https://docs.ethers.org/v6/) (Atualizado para v6, que é a versão utilizada no projeto)