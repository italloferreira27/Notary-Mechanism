# Notary Mechanism
[![NPM](https://img.shields.io/npm/l/react)](https://github.com/italloferreira27/Notary-Mechanism/blob/sepolia-amoy--hardhat/LICENSE) 
## Sobre o Projeto

Esse projeto tem como objetivo realizar a interoperação de Tokens fungivéis ERC20 entre as redes teste Sepolia e Amoy com base na implementação do mecanismo notárial.

## Conceitos:
### Interoperabilidade
A interoperabilidade é a capacidade de sistemas distintos de se comunicarem e interagirem entre si. A interoperabilidade é um conceito fundamental para a integração de sistemas, pois permite que diferentes sistemas possam trocar informações e compartilhar recursos.

### Tokens Fungíveis (ERC20)
Os tokens fungíveis são tokens que podem ser trocados entre si de forma equivalente, ou seja, um token fungível é igual a outro token fungível. Os tokens fungíveis são representados por contratos inteligentes que seguem o padrão ERC20, que define uma interface padrão para a criação de tokens na blockchain Ethereum. Os tokens fungíveis são amplamente utilizados em aplicações financeiras, como pagamentos, empréstimos e investimentos.

### Mecanismo Notarial
O mecanismo notarial atua como um intermediário confiável que valida e registra transações ou eventos entre diferentes blockchains. Ele permite a realização de transações entre redes distintas, garantindo a integridade e a autenticidade das informações trocadas. O mecanismo notarial é composto por um conjunto de contratos inteligentes que são responsáveis por realizar a comunicação entre as redes, garantindo a segurança e a confiabilidade das informações trocadas.

## Execução

* Instale as dependências do projeto:
```bash
npm install
```
* Preencha o arquivo `.env` com as chaves privadas das contas que serão utilizadas para efetuar as transações e com as URLs dos nós das redes.

* Inicialmente é preciso fazer os deploys nas duas redes de teste, tanto na amoy quanto na sepolia:
```bash
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat run scripts/deploy.js --network amoy
```

* Depois executar o stake.js, que vão ser as contas responsáveis por efetuar a interoperação:
```bash
npx hardhat run scripts/stake.js
```

* Por fim com o script `transacao.js` fará um deposito na rede sepolia, indicando um endereço da amoy e o stake irá efetuar a operação para esse endereço na rede amoy:
```bash
npx harhat run scripts/transacao.js
```
