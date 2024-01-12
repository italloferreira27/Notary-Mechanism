const Notary = artifacts.require("Notary");

contract("Notary", (accounts) => {
    let notaryInstance;

    before(async () => {
        notaryInstance = await Notary.deployed();
    });

    const totalTransactions = 10;

    it("should measure time and gas for receiveFunds function for 10 transactions", async () => {
        let totalGasUsed = 0;
        const totalStartTime = new Date().getTime();

        for (let i = 0; i < totalTransactions; i++) {
            const senderAccount = accounts[i % accounts.length]; // Use different accounts in a cyclic manner
            const recipientAccount = accounts[(i + 1) % accounts.length]; // Use different recipient accounts

            const startTime = new Date().getTime();
            const result = await notaryInstance.receiveFunds(recipientAccount, { from: senderAccount, value: web3.utils.toWei("1", "ether") });
            const endTime = new Date().getTime();
            const gasUsed = result.receipt.gasUsed;

            console.log(`Transaction ${i + 1}:`);
            console.log("Sender Account:", senderAccount);
            console.log("Recipient Account:", recipientAccount);
            console.log("Time taken:", endTime - startTime, "ms");
            console.log("Gas used:", gasUsed);
            console.log("----------------------------");

            totalGasUsed += gasUsed;
        }

        const totalEndTime = new Date().getTime();
        console.log("Total time taken for all transactions:", totalEndTime - totalStartTime, "ms");
        console.log("Total gas used for all transactions:", totalGasUsed);
    });

    // it("should measure time and gas for receiveFunds function", async () => {
    //     const startTime = new Date().getTime();
    //     const result = await notaryInstance.receiveFunds(accounts[1], { from: accounts[2], value: web3.utils.toWei("1", "ether") });
    //     const endTime = new Date().getTime();
    //     const gasUsed = result.receipt.gasUsed;
    //     console.log("Time taken:", endTime - startTime, "ms");
    //     console.log("Gas used:", gasUsed);
    //     //assert.isTrue(notaryInstance.fundsReceived(), "Funds not received");
    // });

    // it("should measure time and gas for transferContract function", async () => {
    //     const startTime = new Date().getTime();
    //     const result = await notaryInstance.transferContract({ value: web3.utils.toWei("0.5", "ether") });
    //     const endTime = new Date().getTime();
    //     const gasUsed = result.receipt.gasUsed;
    //     console.log("Time taken:", endTime - startTime, "ms");
    //     console.log("Gas used:", gasUsed);
    // });

    it("should measure time and gas for transferContract function for 10 transactions", async () => {
        let totalGasUsed = 0;
        const totalStartTime = new Date().getTime();

        for (let i = 0; i < totalTransactions; i++) {
            const senderAccount = accounts[i % accounts.length]; // Use different accounts in a cyclic manner

            const startTime = new Date().getTime();
            const result = await notaryInstance.transferContract({ from: senderAccount, value: web3.utils.toWei("0.5", "ether") });
            const endTime = new Date().getTime();
            const gasUsed = result.receipt.gasUsed;

            console.log(`Transaction ${i + 1}:`);
            console.log("Sender Account:", senderAccount);
            console.log("Time taken:", endTime - startTime, "ms");
            console.log("Gas used:", gasUsed);
            console.log("----------------------------");

            totalGasUsed += gasUsed;
        }

        const totalEndTime = new Date().getTime();
        console.log("Total time taken for all transactions:", totalEndTime - totalStartTime, "ms");
        console.log("Total gas used for all transactions:", totalGasUsed);
    });

    // it("should measure time and gas for sendEther function", async () => {
    //     const startTime = new Date().getTime();
    //     const result = await notaryInstance.sendEther(accounts[1], web3.utils.toWei("0.5", "ether"), { from: accounts[0] });
    //     const endTime = new Date().getTime();
    //     const gasUsed = result.receipt.gasUsed;
    //     console.log("Time taken:", endTime - startTime, "ms");
    //     console.log("Gas used:", gasUsed);
    // });

    it("should measure time and gas for sendEther function for 10 transactions", async () => {
        let totalGasUsed = 0;
        const totalStartTime = new Date().getTime();

        for (let i = 0; i < totalTransactions; i++) {
            const senderAccount = accounts[0]; // Use different accounts in a cyclic manner
            const recipientAccount = accounts[(i + 1) % accounts.length]; // Use different recipient accounts

            const startTime = new Date().getTime();
            const result = await notaryInstance.sendEther(recipientAccount, web3.utils.toWei("0.5", "ether"), { from: senderAccount });
            const endTime = new Date().getTime();
            const gasUsed = result.receipt.gasUsed;

            console.log(`Transaction ${i + 1}:`);
            console.log("Sender Account:", senderAccount);
            console.log("Recipient Account:", recipientAccount);
            console.log("Time taken:", endTime - startTime, "ms");
            console.log("Gas used:", gasUsed);
            console.log("----------------------------");

            totalGasUsed += gasUsed;
        }

        const totalEndTime = new Date().getTime();
        console.log("Total time taken for all transactions:", totalEndTime - totalStartTime, "ms");
        console.log("Total gas used for all transactions:", totalGasUsed);
    });

});
