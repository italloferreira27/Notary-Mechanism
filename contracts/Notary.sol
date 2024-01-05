// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Notary{

    address public accountNotary; // Conta na blockchain do notário
    address public sender; // Conta que enviou na Blockchain A
    address public recipient; // Conta destino na blockchain B
    uint256 public value; // Valor a ser transferido
    bool public fundsReceived;

    constructor(){
        accountNotary = msg.sender;
    }

    function receiveFunds(address _recipient) external payable {
        require(msg.value > 0, "Value must be greater than 0");
        require(_recipient != address(0), "Invalid recipient address");

        value = msg.value;
        sender = msg.sender;
        recipient = _recipient;

        (bool success, ) = payable(accountNotary).call{value: msg.value}("");
        require(success, "Transfer failed");

        fundsReceived = true;
    }

     function verifyFundsReceived() external view returns(bool) {
        return fundsReceived;
    }

    function transferContract() external payable {

    }   

    function sendEther(address payable _recipient, uint256 _amount) external {
        // Verifica se o chamador da função é o proprietário do contrato
        require(msg.sender == accountNotary, "Unauthorized");

        // Transfere Ether para o destinatário especificado
        require(address(this).balance >= _amount, "Insufficient balance in contract");
        _recipient.transfer(_amount);
    }
}

//.......Migrar os contratos nas blockchains........
// truffle migrate --network blockchainA --reset 
// truffle migrate --network blockchainB --reset
//..................................................

//............Interagir com os contratos.............
//  truffle console --network blockchainA
//  truffle console --network blockchainB
//...................................................

//............BLOCKCHAIN A..........................
//  let notary = await Notary.deployed()
//  let contas = await web3.eth.getAccounts()
//  notary.receiveFunds("0xf1318EA025Ea1Aa9D9B35DfF384F799695231Df4", {value: 10000000000000000000, from: contas[1]})
//...................................................

//............BLOCKCHAIN B..........................
//  let notary = await Notary.deployed()
//  let contas = await web3.eth.getAccounts()
//  notary.transferContract({value: 10000000000000000000, from: contas[0]})
//  web3.eth.getBalance(notary.address)   --> saldo do contrato

//  const valor = web3.utils.toWei('10', 'ether')
//  notary.sendEther("0xf1318EA025Ea1Aa9D9B35DfF384F799695231Df4", valor)