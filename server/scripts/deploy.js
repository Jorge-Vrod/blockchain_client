async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    // Deploy the Campaign contract
    const Campaign = await ethers.getContractFactory("Campaign");
    const campaign = await Campaign.deploy(1, 10000, 10000000); // Example constructor arguments
  
    await campaign.waitForDeployment(); // Wait for deployment to complete
    console.log("Campaign deployed to:", campaign.target);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Deployment failed:", error);
      process.exit(1);
    });
  