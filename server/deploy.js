const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ethers } = require("hardhat");
const fs = require("fs");
const CampaignABI = require("./artifacts/contracts/Campaign.sol/Campaign.json"); // Load ABI from artifacts

const app = express();
const PORT = 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Deploy Campaign Contract
app.post("/deploy-campaign", async (req, res) => {
  try {
    const { id, goal, duration } = req.body;

    console.log(id, goal, duration);
    // Deploy the Campaign contract using Hardhat
    const Campaign = await ethers.getContractFactory("Campaign");
    const campaign = await Campaign.deploy(id, goal, duration);
    await campaign.waitForDeployment();

    console.log("Campaign with id " + id + " created successfully!");
    const contractAddress = campaign.target;
    const contractAbi = CampaignABI.abi;

    // Retrieve the nftBadge address using the Campaign contract
    const nftBadgeAddress = await campaign.getNFTBadgeAddress();

    console.log("NFTBadge address for campaign:", nftBadgeAddress);

    res.status(200).json({
      address: contractAddress,
      abi: contractAbi,
      nftBadgeAddress,
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
