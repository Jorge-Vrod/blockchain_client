const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ethers } = require("hardhat");
const fs = require("fs");
const CampaignABI = require("../artifacts/contracts/Campaign.sol/Campaign.json"); // Load ABI from artifacts

const app = express();
const PORT = 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Deploy Campaign Contract
app.post("/deploy-campaign", async (req, res) => {
  try {
    const { id, goal, duration } = req.body;

    console.log("Deploying campaign with ID:", id);
    console.log("Goal:", goal);
    console.log("Duration:", duration);

    // Get the creator's wallet address (assuming using Hardhat's first account)
    const [creator] = await ethers.getSigners();
    const creatorAddress = await creator.getAddress();

    // Get the provider from the signer
    const provider = creator.provider;

    // Log creator's initial balance
    const initialBalance = await provider.getBalance(creatorAddress);
    console.log("Creator's initial balance (ETH):", ethers.formatEther(initialBalance));

    // Deploy the Campaign contract using Hardhat
    const Campaign = await ethers.getContractFactory("Campaign");
    const campaign = await Campaign.connect(creator).deploy(id, goal, duration);
    await campaign.waitForDeployment();

    console.log("Campaign with id " + id + " created successfully!");
    const contractAddress = campaign.target;
    const contractAbi = CampaignABI.abi;

    // Retrieve the nftBadge address using the Campaign contract
    const nftBadgeAddress = await campaign.getNFTBadgeAddress();

    console.log("NFTBadge address for campaign:", nftBadgeAddress);

    // Log creator's final balance
    const finalBalance = await provider.getBalance(creatorAddress);
    console.log("Creator's final balance (ETH):", ethers.formatEther(finalBalance));

    res.status(200).json({
      address: contractAddress,
      abi: contractAbi,
      nftBadgeAddress
    });
  } catch (error) {
    console.error("Error deploying contract:", error);
    res.status(500).json({ error: "Contract deployment failed." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
