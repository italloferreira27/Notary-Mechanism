// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract pay{

    address public owner;

    constructor(){
        owner = msg.sender;
    }

    function receber() public payable{
        payable(owner).transfer(msg.value);
    }
}

//  let instance = await pay.deployed()
//  let contas = await web3.eth.getAccounts()
//  instance.receber({value: 10000000000000000000, from: contas[1]})
//  instance.receber().send({from: contas[1], value: 10000000000000000000})