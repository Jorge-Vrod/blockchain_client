// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract NFTBadge is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct BadgeTier {
        string name;
        uint256 minContribution;
        uint256 maxContribution;
    }

    struct Badge {
        uint256 tierIndex;
        uint256 campaignId;
    }

    BadgeTier[] public badgeTiers;
    mapping(uint256 => Badge) public badges;
    address public crowdfundingContract;

    event BadgeMinted(uint256 badgeId, address indexed recipient, uint256 tierIndex);
    event BadgeTierAdded(string name, uint256 minContribution, uint256 maxContribution);
    event BadgeTierRemoved(uint256 index);
    event BadgeTierUpdated(uint256 index, string name, uint256 minContribution, uint256 maxContribution);

    constructor(address _crowdfundingContract) ERC721("CrowdfundingBadge", "CFB") Ownable() {
        require(_crowdfundingContract != address(0), "Invalid crowdfunding contract address");
        crowdfundingContract = _crowdfundingContract;

        // Initialize with a single default tier
        badgeTiers.push(BadgeTier("Bronze", 0.01 ether, 0.1 ether));
        badgeTiers.push(BadgeTier("Silver", 0.1 ether, 0.5 ether));
        badgeTiers.push(BadgeTier("Gold", 0.5 ether, 1 ether));
        badgeTiers.push(BadgeTier("Platinum", 1 ether, type(uint256).max));

        console.log("Address of the NFTBadge contract:", address(this));
    }

    // Add a function to set the Crowdfunding contract address (can only be called once by the owner)
    function setCrowdfundingContract(address _crowdfundingContract) external onlyOwner {
        require(crowdfundingContract == address(0), "Crowdfunding contract already set");
        require(_crowdfundingContract != address(0), "Invalid address");
        require(isContract(_crowdfundingContract), "Address is not a contract");

        crowdfundingContract = _crowdfundingContract;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://api.crowdfunding.com/badge/";
    }

    function isContract(address account) private view returns (bool) {
        return account.code.length > 0;
    }

    // Ensure only the Crowdfunding contract can call the mintBadge function
    modifier onlyCrowdfunding() {
        require(msg.sender == crowdfundingContract, "Only the Crowdfunding contract can mint badges");
        _;
    }

    // Mint NFT badge to contributors (restricted to Crowdfunding contract)
    function mintBadge(address recipient, uint256 campaignId, uint256 amount) external onlyCrowdfunding nonReentrant returns (bool) {
        uint256 tierIndex = _getTierIndexByContribution(amount);
        console.log("Calculated tierIndex for contribution of :", amount, tierIndex);
        if (tierIndex >= badgeTiers.length) {
            return false;  // No badge will be minted if no matching tier
        }


        _tokenIds.increment();
        uint256 newBadgeId = uint(keccak256(abi.encodePacked(_tokenIds.current(), address (this))));
        _safeMint(recipient, newBadgeId);  // Mint the NFT to the contributor (recipient)

        badges[newBadgeId] = Badge(tierIndex, campaignId);
        emit BadgeMinted(newBadgeId, recipient, tierIndex);
        console.log("BadgeMinted emitted with ID:", newBadgeId);

        return true;  // Badge was minted
    }

    // Find the tier index based on the contribution amount
    function _getTierIndexByContribution(uint256 amount) private view returns (uint256) {
        for (uint256 i = 0; i < badgeTiers.length; i++) {
            if (amount >= badgeTiers[i].minContribution && amount <= badgeTiers[i].maxContribution) {
                return i;
            }
        }
        return badgeTiers.length;
    }

    // View badge details
    function getBadgeDetails(uint256 tokenId) external onlyCrowdfunding view returns (string memory tierName, address owner, uint256 campaignId) {
        Badge memory badge = badges[tokenId];
        return (badgeTiers[badge.tierIndex].name, ownerOf(tokenId), badge.campaignId);
    }

    // Add a new badge tier (only the contract owner can do this)
    function addBadgeTier(string memory name, uint256 minContribution, uint256 maxContribution) external onlyCrowdfunding onlyOwner {
        require(minContribution > 0, "Minimum contribution must be greater than 0");
        require(maxContribution > minContribution, "Maximum contribution must be greater than minimum contribution");

        badgeTiers.push(BadgeTier(name, minContribution, maxContribution));
        emit BadgeTierAdded(name, minContribution, maxContribution);
    }

    // Update an existing badge tier (only the contract owner can do this)
    function updateBadgeTier(uint256 index, string memory name, uint256 minContribution, uint256 maxContribution) external onlyCrowdfunding onlyOwner {
        require(index < badgeTiers.length, "Invalid tier index");
        require(minContribution > 0, "Minimum contribution must be greater than 0");
        require(maxContribution > minContribution, "Maximum contribution must be greater than minimum contribution");

        badgeTiers[index] = BadgeTier(name, minContribution, maxContribution);
        emit BadgeTierUpdated(index, name, minContribution, maxContribution);
    }

    // Remove a badge tier (only the contract owner can do this)
    function removeBadgeTier(uint256 index) external onlyOwner {
        require(index < badgeTiers.length, "Invalid tier index");

        // Shift tiers to remove the element at index
        for (uint256 i = index; i < badgeTiers.length - 1; i++) {
            badgeTiers[i] = badgeTiers[i + 1];
        }
        badgeTiers.pop();

        emit BadgeTierRemoved(index);
    }

    // Override transfer functions to make badges non-transferable
    function transferFrom(address, address, uint256) public pure override {
        revert("Badges are non-transferable");
    }

    function safeTransferFrom(address, address, uint256) public pure override {
        revert("Badges are non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Badges are non-transferable");
    }
}


contract Campaign is ReentrancyGuard {
    uint128 id;
    address payable creator;
    uint128 fundingGoal;
    uint256 creationTime;
    uint256 endTime;
    uint256 totalRaised;
    bool isFunded;
    bool fundsClaimed;
    mapping(address => uint256) contributions;
    mapping(address => bool) hasRefunded;
    NFTBadge immutable private nftFactory;

    event CampaignCreated(uint128 campaignId, address indexed creator, uint128 fundingGoal, uint256 deadline, address nftBadgeAddress);
    event ContributionMade(uint128 campaignId, address indexed contributor, uint256 amount, bool badgeMinted);
    event CampaignFunded(uint128 campaignId, uint256 totalRaised);
    event FundsReleased(uint128 campaignId, address creator, uint256 amount);
    event RefundClaimed(uint128 campaignId, address indexed sender, uint256 amount);

    // Constructor initializes the NFTBadge contract
    constructor(uint128 _id, uint128 _fundingGoal, uint128 _duration) {
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        id = _id;
        creator = payable(msg.sender);
        fundingGoal = _fundingGoal;
        creationTime = block.timestamp;
        endTime = creationTime + _duration;
        totalRaised = 0;
        isFunded = false;
        fundsClaimed = false;

        nftFactory = new NFTBadge(address(this)); // Deploy the NFTBadge contract

        emit CampaignCreated(
            _id,
            msg.sender,
            _fundingGoal,
            creationTime + _duration,
            address(nftFactory) // Add the NFTBadge address to the event
        );
    }

    function getNFTBadgeAddress() external view returns (address) {
        return address(nftFactory);
    }

    // Contribute to a campaign
    function contribute() external payable {
        require(block.timestamp < endTime, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");
        require(!fundsClaimed, "Campaing is closed");
        
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;

        if (!isFunded && totalRaised >= fundingGoal) {
            isFunded = true;
            emit CampaignFunded(id, totalRaised);
        }

        console.log("Minting badge for campaign:", id);
        bool badgeMinted = nftFactory.mintBadge(msg.sender, id, msg.value);
        emit ContributionMade(id, msg.sender, msg.value, badgeMinted);
    }

    // Get campaign status
    function getCampaignStatus() external view returns (address, uint256, uint256, uint256, bool, bool) {
        return (
            creator,
            totalRaised,
            fundingGoal,
            endTime > block.timestamp ? endTime - block.timestamp : 0,
            isFunded,
            fundsClaimed
        );
    }

    // Release funds to the campaign creator if the goal is met
    function releaseFunds() external nonReentrant {
        require(msg.sender == creator, "Funds can only be released by creator");
        require(isFunded, "Campaign is not funded");
        require(block.timestamp >= endTime, "Campaign has not ended");
        require(!fundsClaimed, "Funds have already been claimed");

        fundsClaimed = true;
        creator.transfer(totalRaised);

        emit FundsReleased(id, creator, totalRaised);
    }


    function claimRefund() external {
        require(!isFunded, "Campaign is funded");
        require(block.timestamp >= endTime, "Campaign has not ended");
        require(!hasRefunded[msg.sender], "Refund already claimed");

        uint256 contribution = contributions[msg.sender];
        require(contribution > 0, "No contribution found");

        hasRefunded[msg.sender] = true;
        contributions[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: contribution}("");
        require(sent, "Failed to send Ether");

        emit RefundClaimed(id, msg.sender, contribution);
    }
}