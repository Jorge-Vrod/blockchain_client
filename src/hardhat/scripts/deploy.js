async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    // Deploy the Campaign contract
    const Campaign = await ethers.getContractFactory("Campaign");
    const campaign = await Campaign.deploy(1, 10000, 10000000); // Example constructor arguments
  
    await campaign.waitForDeployment(); // Wait for deployment to complete
    console.log("Campaign deployed to:", campaign.target);
  
    // Deploy the NFTBadge contract
    /*const NFTBadge = await ethers.getContractFactory("NFTBadge");
    const nftBadge = await NFTBadge.deploy(campaign.target); // Pass the Campaign contract's address
  
    await nftBadge.waitForDeployment(); // Wait for deployment to complete
    console.log("NFTBadge deployed to:", nftBadge.target);*/
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Deployment failed:", error);
      process.exit(1);
    });
  