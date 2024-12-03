import CampaignABI from "../server/artifacts/contracts/Campaign.sol/Campaign.json";
import NFTBadgeABI from "../server/artifacts/contracts/Campaign.sol/NFTBadge.json";
import IpfsABI from "./assets/contracts/IpfsStorage.json";

export const ipfsAddress = "0x065d92a7bef1dec6dd075dc1895db19f85df5fb9";

export const Campaign = { abi: CampaignABI.abi };
export const NFTBadge = { abi: NFTBadgeABI.abi };
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
