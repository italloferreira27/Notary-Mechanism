const Notary = artifacts.require("Notary");
const Token = artifacts.require("Token");

contract("Notary", (accounts) => {
    let notaryInstance;
    let tokenInstance;

    before(async () => {
        notaryInstance = await Notary.deployed();
        tokenInstance = await Token.deployed();
    });

    it("Aprovar que o Notary gaste os tokens", async () => {
        const senderAccount = accounts[0]; // Account que fará o stake
        const amount = web3.utils.toWei("11", "ether"); // 10 tokens para stake
        console.log("amount:", amount); 
        const startTime = new Date().getTime();
        console.log('account:', senderAccount);
        const result = await tokenInstance.approve(notaryInstance.address, amount, { from: senderAccount });
        console.log('Address notary:', notaryInstance.address);
        console.log('Address Token:', tokenInstance.address);
        const balance = await tokenInstance.balanceOf(senderAccount);
        console.log('Balance:', balance.toString());

        //const tx = await notaryInstance.stake(amount, { from: senderAccount});

        const endTime = new Date().getTime();
        const gasUsed_ap = result.receipt.gasUsed;
        // const gasUsed_st = tx.receipt.gasUsed;

        console.log("Tempo gasto:", endTime - startTime, "ms");
        console.log("Gas usado para aprovar:", gasUsed_ap);
        // console.log("Gas usado para stake:", gasUsed_st);

    });
});
