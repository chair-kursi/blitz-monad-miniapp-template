const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying TypingTournament contract to Monad Testnet...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);

    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "MON\n");

    if (balance === 0n) {
        throw new Error("❌ Deployer account has no MON tokens!");
    }

    // Entry fee: 0.1 MON
    const entryFee = ethers.parseEther("0.1");
    console.log("🎮 Entry fee set to:", ethers.formatEther(entryFee), "MON\n");

    // Deploy contract
    console.log("⏳ Deploying contract...");
    const TypingTournament = await ethers.getContractFactory("TypingTournament");
    const contract = await TypingTournament.deploy(entryFee);

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("✅ Contract deployed to:", contractAddress);
    console.log("🔑 Contract owner:", await contract.owner());
    console.log("💵 Entry fee:", ethers.formatEther(await contract.entryFee()), "MON\n");

    // Transfer ownership to server address
    const serverAddress = process.env.SERVER_ADDRESS;
    if (serverAddress) {
        console.log("🔄 Transferring ownership to server:", serverAddress);
        const tx = await contract.transferOwnership(serverAddress);
        await tx.wait();
        console.log("✅ Ownership transferred!\n");
    }

    // Save contract address and ABI
    const deploymentInfo = {
        contractAddress,
        entryFee: entryFee.toString(),
        network: "monad-testnet",
        chainId: 10143,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        owner: serverAddress || deployer.address,
    };

    // Save to parent directory
    const infoPath = path.join(__dirname, "../../deployment-info.json");
    fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved to:", infoPath);

    // Save ABI
    const artifact = await ethers.getContractFactory("TypingTournament");
    const abi = artifact.interface.formatJson();
    const abiPath = path.join(__dirname, "../../lib/contract-abi.json");
    fs.writeFileSync(abiPath, abi);
    console.log("📄 Contract ABI saved to:", abiPath);

    console.log("\n✨ Deployment complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Copy this contract address to your .env.local:");
    console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
    console.log("2. Start the backend server");
    console.log("3. Start the frontend\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
