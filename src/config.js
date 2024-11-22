import CampaignABI from "./hardhat/artifacts/contracts/Campaign.sol/Campaign.json";
import NFTBadgeABI from "./hardhat/artifacts/contracts/Campaign.sol/NFTBadge.json";
import IpfsABI from "./assets/contracts/IpfsStorage.json";

export const campaignAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const nftBadgeAddress = "0xa16e02e87b7454126e5e10d957a927a7f5b5d2be";
export const ipfsAddress = "0x065d92a7bef1dec6dd075dc1895db19f85df5fb9";

export const Campaign = { abi: CampaignABI.abi, address: campaignAddress };
export const NFTBadge = { abi: NFTBadgeABI.abi, address: nftBadgeAddress };
export const IPFS = { abi: IpfsABI, address: ipfsAddress };

export default {
  colors: {
    default: "#344675",
    primary: "#42b883",
    info: "#1d8cf8",
    danger: "#fd5d93",
    teal: "#00d6b4",
    primaryGradient: [
      "rgba(76, 211, 150, 0.1)",
      "rgba(53, 183, 125, 0)",
      "rgba(119,52,169,0)",
    ],
  },
};
