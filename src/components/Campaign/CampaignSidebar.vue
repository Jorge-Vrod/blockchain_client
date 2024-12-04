<template>
  <aside class="bg-dark rounded p-4 shadow sticky-sidebar">
    <!-- Existing progress and donation section -->
    <div class="progress-meter d-flex align-items-center justify-content-between mb-4">
      <div class="progress-info w-50 text-start pe-3">
        <h3 class="text-success mb-1">{{ formattedFundsRaised }} € funded</h3>
        <p class="text-muted mb-0">
          <strong>Objective of {{ formattedFundsNeeded }} €</strong>
        </p>
      </div>
      <div class="progress-circle w-50 text-end ps-3">
        <ProgressCircle
          :progress-data="{percentage: progressPercentage, stroke: progressCircleStroke}"
        />
      </div>
    </div>
    
    <!-- Donate button now triggers modal -->
    <button v-if="!campaign.isFunded" class="btn btn-warning btn-lg w-100 mb-3" @click="openDonationModal">Donate now</button>
    <button class="btn btn-outline-secondary btn-lg w-100">Share</button>
    
    <DonationList :donations="recentDonations" />

    <!-- Donation Modal -->
    <div v-if="showDonationModal" class="modal-overlay">
      <div class="bg-dark modal-content">
        <div class="modal-header">
          <h4 class="text-muted">Make donation</h4>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <input 
              id="donationAmount"
              v-model="donationAmount" 
              type="number" 
              class="form-control" 
              placeholder="Ingrese la cantidad a donar"
              min="1"
              step="0.01"
            />
            <small v-if="errorMessage" class="text-danger">{{ errorMessage }}</small>
          </div>
        </div>
        <div v-if="nftHash">
          <nft-generator ref="nft-generator" :nft-hash="this.nftHash"></nft-generator>
        </div>
        <div class="modal-footer d-flex justify-content-between mb-3">
          <button 
            class="btn btn-secondary me-2 text-center d-flex align-items-center justify-content-center" 
            @click="closeDonationModal"
          >
            Cancelar
          </button>
          <button 
            class="btn btn-primary text-center d-flex align-items-center justify-content-center" 
            @click="handleSubmit"
            :disabled="!donationAmount || donationAmount <= 0"
          >
            Donar
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>
  
  <script>
  import ProgressCircle from "@/components/Campaign/ProgressCircle";
  import DonationList from "@/components/Campaign/DonationList";
  import { connectMetaMask, handleDonation, weiToDollars } from '@/services/etherService';
  import { uploadToIPFS, setFileIPFS, readFileIPFS } from '@/services/ipfsService';
  import { ethers } from "ethers";
  import { NFTBadge, Campaign, IPFS } from "@/config";
  import NFTGenerator from "@/components/NFTGenerator.vue";

  export default {
    components: { ProgressCircle, DonationList, 'nft-generator': NFTGenerator, },
    props: {
        campaign: Object,   
        recentDonations: Array,
    },
    data() {
      return {
        nftHash: null,
        localProvider: null,
        defaultProvider: null,
        ipfsContract: null,
        campaignContract: null,
        nftBadgeContract: null,
        donationAmount: null,
        errorMessage: '',
        successMessage: '',
        showDonationModal: false,
      };
    },
    async created() {
      this.localProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

      this.campaignContract = new ethers.Contract(this.campaign.contractAddress, Campaign.abi, this.localProvider);
      this.nftBadgeContract = new ethers.Contract(this.campaign.nftBadgeAddress, NFTBadge.abi, this.localProvider);
      this.setupBadgeMintedListener();
      this.getCampaignDetails();

      this.defaultProvider = new ethers.providers.Web3Provider(window.ethereum);
      this.ipfsContract = new ethers.Contract(IPFS.address, IPFS.abi, this.defaultProvider);

      window.ethereum.enable();
    },
    computed: {
      progressPercentage() {
          return ((this.campaign.dollarsFunded / this.campaign.objective) * 100).toFixed(2);
      },
      progressCircleStroke() {
        const circumference = 226; 
        const progress = (this.campaign.dollarsFunded / this.campaign.objective) * circumference;
        return `${progress}, ${circumference}`;
      },
      formattedFundsRaised() {
        return new Intl.NumberFormat().format(this.campaign.dollarsFunded);
      },
      formattedFundsNeeded() {
        return new Intl.NumberFormat().format(this.campaign.objective);
      },
    },
    methods: {
      async getCampaignDetails() {
        var campaignDetails = await this.campaignContract.getCampaignStatus();
        this.campaign = {
          ...this.campaign,
          creatorAddress: campaignDetails[0],
          dollarsFunded: weiToDollars(campaignDetails[1]._hex),
          isFunded: campaignDetails[4]
        };
      },
      setupBadgeMintedListener() {
        this.nftBadgeContract.removeAllListeners("BadgeMinted");
        this.nftBadgeContract.on("BadgeMinted", async (badgeId, recipient, tierIndex) => {

          // Check recipient address and update UI
          const signerAddress = (await this.localProvider.getSigner().getAddress()).toLowerCase();
          if (recipient.toLowerCase() === signerAddress) {
            this.successMessage = `Badge minted successfully! Badge ID: ${badgeId}`;
            this.nftHash = badgeId._hex;
            if (this.nftHash) {
              this.getCampaignDetails();
              await this.uploadToIPFS();
            }
          }
        });
      },
      openDonationModal() {
        this.showDonationModal = true;
        this.errorMessage = '';
        this.donationAmount = null;
      },
      closeDonationModal() {
        this.showDonationModal = false;
        this.errorMessage = '';
        this.donationAmount = null;
      },
      async connectMetaMask() {
        try {
          await connectMetaMask();
        } catch (error) {
          console.error("Error connecting to MetaMask:", error.message);
          alert("Error connecting to MetaMask: " + error.message);
        }
      },
      async readFile() {
        try {
          const signer = this.localProvider.getSigner();
          this.ipfsHash = await readFileIPFS(this.ipfsContract, signer);
        } catch (error) {
          console.error("Error reading file from IPFS:", error.message);
          this.errorMessage = "Error reading file. Please try again.";
        }
      },
      async setFileIPFS(hash) {
        try {
          const signer = this.localProvider.getSigner();
          this.ipfsHash = await setFileIPFS(this.ipfsContract, signer, hash);
        } catch (error) {
          console.error("Error setting IPFS hash:", error.message);
          this.errorMessage = "Error saving IPFS hash. Please try again.";
        }
      },
      async handleSubmit() {
        if (this.donationAmount === "" || isNaN(this.donationAmount) || this.donationAmount <= 0) {
          this.errorMessage = "Please enter a valid donation amount.";
          return;
        }

        this.errorMessage = "";
        this.successMessage = "Processing your donation...";

        try {
          console.log(`Donating ${this.donationAmount} to ${this.campaignContract} with provider: ${this.localProvider}`);
          const receipt = await handleDonation(this.campaignContract, this.localProvider, this.donationAmount);
          this.successMessage = "Donation successful! Waiting for badge generation...";
        } catch (error) {
          console.error("Error processing donation:", error.message);
          this.errorMessage = "There was an issue with your donation. Please try again.";
        }
      },
      async uploadToIPFS() {
        this.errorMessage = "";
        this.uploadMessage = "Uploading image to IPFS...";

        try {
          const nftGenerator = this.$refs['nftGenerator'];
          if (!nftGenerator) return;

          const canvas = nftGenerator.$refs.canvas;
          const canvasBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
          if (!canvasBlob) throw new Error("Failed to generate canvas image blob.");

          const cid = await uploadToIPFS(canvasBlob);
          this.uploadMessage = "Image uploaded successfully! CID: " + cid;
        } catch (error) {
          console.error("Error during upload:", error.message);
          this.uploadMessage = "Error uploading image to IPFS.";
        }
      },
    },
  };
  </script>
  <style scoped>
  .sticky-sidebar {
    position: sticky;
    top: 20px; /* Adds 20px padding from the top when sticky */
  }
  .progress-info {
    flex: 1;
    text-align: left;
  }
  .progress-circle {
    flex: 1;
    text-align: right;
  }
  .progress-meter {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .pe-3 {
    padding-right: 1rem;
  }

  .ps-3 {
    padding-left: 1rem;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    padding: 20px;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .modal-title {
    margin: 0;
  }
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }
  .modal-body {
    margin-bottom: 15px;
  }
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 15px;
  }

  </style>