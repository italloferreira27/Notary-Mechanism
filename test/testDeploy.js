const Notary = artifacts.require("Notary");

contract("Deployment", () => {
    it("should measure time and gas for contract deployment", async () => {
        const startTime = new Date().getTime();
        const notaryInstance = await Notary.new(); // Deploy the contract
        const endTime = new Date().getTime();

        // Get the transaction receipt to obtain gasUsed
        const txReceipt = await web3.eth.getTransactionReceipt(notaryInstance.transactionHash);
        const gasUsed = txReceipt.gasUsed;

        console.log("Time taken for deployment:", endTime - startTime, "ms");
        console.log("Gas used for deployment:", gasUsed);
        
        // Optionally, you can log the deployed contract address
        console.log("Contract deployed at:", notaryInstance.address);
    });
});
