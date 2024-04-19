# Notary Mechanism

### Truffle console
```
const notaryInstance = await Notary.deployed();
const tokenInstance = await Token.deployed();
const accounts = await web3.eth.getAccounts();

const sender = accounts[0];
const amount = web3.utils.toWei("10", "ether");

const ap = await tokenInstance.approve(notaryInstance.address, amount, { from: sender });
ap.receipt.gasUsed;
const stake = await notaryInstance.stake(amount, { from: senderAccount });
```