<template>
  <div class="campaign-detail">
    <div class="container">
      <!-- Campaign Header -->
      <div class="row mb-4">
        <div class="col-12 text-center">
          <h1 class="campaign-title">{{ campaign.name }}</h1>
          <p class="campaign-description">{{ campaign.description }}</p>
        </div>
      </div>

      <!-- Campaign Image and Info -->
      <div class="row align-items-center">
        <div class="col-md-6">
          <img :src="campaign.image" alt="Campaign Image" class="img-fluid rounded shadow" />
        </div>
        <div class="col-md-6">
          <div class="campaign-info">
            <p><strong>Funding Progress:</strong></p>
            <div class="progress mb-3">
              <div
                class="progress-bar"
                role="progressbar"
                :style="{ width: progressPercentage + '%' }"
                :aria-valuenow="progressPercentage"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {{ progressPercentage }}%
              </div>
            </div>
            <p><strong>Funds Needed:</strong> ${{ campaign.dollarsNeeded }}</p>
            <p><strong>Funds Raised:</strong> ${{ campaign.dollarsFunded }}</p>
            <p><strong>Viewed in Last Hour:</strong> {{ campaign.viewedLastHour }}</p>
            <div class="col-md-6">
              <div class="row mt-5">
                <form @submit.prevent="handleSubmit">
                  <input
                    type="text"
                    class="form-control"
                    v-model="donationAmount"
                    placeholder="Donation quantity (USD)"
                  />
                  <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
                  <button type="submit" class="btn">Support campaign</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Campaign Objectives -->
      <div class="row mt-5">
        <div class="col-12">
          <h3>Campaign Objectives</h3>
          <ul>
            <li><strong>$100,000:</strong> Saving the forest by protecting endangered areas.</li>
            <li><strong>$200,000:</strong> Launch a large-scale reforestation project.</li>
            <li><strong>$500,000:</strong> Create long-term conservation programs involving local communities.</li>
          </ul>
        </div>
      </div>

      <!-- Donation Progress Chart -->
      <div class="row mt-5">
        <div class="col-12">
          <h3>Donation Progress Over Time</h3>
          <div class="chart-area">
            <line-chart
              style="height: 100%"
              chart-id="green-line-chart"
              :chart-data="greenLineChart.chartData"
              :gradient-stops="greenLineChart.gradientStops"
              :extra-options="greenLineChart.extraOptions"
            >
            </line-chart>
          </div>
        </div>
      </div>

      <!-- NFT Generator -->
      <div class="row mt-5">
        <div class="col-12">
          <h3>Generate an NFT</h3>
          <nft-generator></nft-generator>
        </div>
      </div>
    </div>
  </div>
</template>
  

<script>
import LineChart from "@/components/Charts/LineChart";
import * as chartConfigs from "@/components/Charts/config";
import config from "@/config";
import { ref, onMounted } from "vue";
import { ethers } from "ethers";
import { Campaign, NFTBadge } from "@/config";
import NFTGenerator from "@/components/NFTGenerator.vue";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000000";

export default {
  components: {
    LineChart,
    'nft-generator': NFTGenerator,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      donationAmount: "",
      ipfsHash: "",
      errorMessage: "",
      uploadMessage: "",
      defaultProvider: null,
      ipfsContract: null,
      campaign: {
        id: 1,
        name: "Save the Rainforest",
        description: "Help us save the Amazon rainforest by funding reforestation projects.",
        dollarsNeeded: 500000,
        dollarsFunded: 120000,
        image: "https://placehold.co/600x400/EEE/31343C",
        viewedLastHour: 90,
      },
      greenLineChart: {
        extraOptions: chartConfigs.greenChartOptions,
        chartData: {
          labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
          datasets: [
            {
              label: "Donations (in USD)",
              fill: true,
              borderColor: config.colors.primary,
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: config.colors.primary,
              pointBorderColor: "rgba(255,255,255,0)",
              pointHoverBackgroundColor: config.colors.primary,
              pointBorderWidth: 20,
              pointHoverRadius: 4,
              pointHoverBorderWidth: 15,
              pointRadius: 4,
              data: [80, 100, 70, 80, 120, 80],
            },
          ],
        },
        gradientColors: [
          "rgba(66,134,121,0.15)",
          "rgba(66,134,121,0.0)",
          "rgba(66,134,121,0)",
        ],
        gradientStops: [1, 0.4, 0],
      },
    };
  },
  computed: {
    progressPercentage() {
      return ((this.campaign.dollarsFunded / this.campaign.dollarsNeeded) * 100).toFixed(2);
    },
  },
  created() {
  this.defaultProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"); // Local Hardhat node

  // Initialize contracts
    this.campaignContract = new ethers.Contract(
      Campaign.address,
      Campaign.abi,
      this.defaultProvider
    );
    this.nftBadgeContract = new ethers.Contract(
      NFTBadge.address,
      NFTBadge.abi,
      this.defaultProvider
    );

    this.setupBadgeMintedListener();
  },
  methods: {
    async readFile() {
      const signer = await this.defaultProvider.getSigner();
      const file = await this.ipfsContract.userFiles(signer.getAddress());
      if (file !== ZERO_ADDRESS) {
        this.ipfsHash = file;
      }
      return true;
    },
    async setFileIPFS(hash) {
      const ipfsWithSigner = this.ipfsContract.connect(
        this.defaultProvider.getSigner()
      );
      const tx = await ipfsWithSigner.setFileIPFS(hash);
      await tx.wait(); // Ensure the transaction is mined before proceeding
      this.ipfsHash = hash;
    },
    async handleSubmit() {
      if (this.donationAmount === "" || isNaN(this.donationAmount) || this.donationAmount <= 0) {
        this.errorMessage = "Please enter a valid donation amount.";
        return;
      }

      this.errorMessage = "";
      this.successMessage = "Processing your donation...";

      try {
        const signer = this.defaultProvider.getSigner();
        const campaignWithSigner = this.campaignContract.connect(signer);

        // Send contribution
        const tx = await campaignWithSigner.contribute({
          value: ethers.utils.parseEther(this.donationAmount.toString()),
        });

        // Wait for transaction to be mined
        let receipt = await tx.wait();
        console.log(receipt.events);

        this.successMessage = "Donation successful! Waiting for badge generation...";
      } catch (error) {
        console.error("Error processing donation:", error);
        this.errorMessage = "There was an issue with your donation. Please try again.";
      }
    },
    setupBadgeMintedListener() {
      this.nftBadgeContract.removeAllListeners("BadgeMinted");
      this.nftBadgeContract.on("BadgeMinted", async (badgeId, recipient, tierIndex) => {
        console.log("BadgeMinted event detected:", badgeId, recipient, tierIndex);

        // Check recipient address and update UI
        const signerAddress = (await this.defaultProvider.getSigner().getAddress()).toLowerCase();
        if (recipient.toLowerCase() === signerAddress) {
          this.successMessage = `Badge minted successfully! Badge ID: ${badgeId}`;
        }
      });
    },
    async generateNFT(tokenURI) {
      try {
        const response = await fetch(tokenURI);
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata from ${tokenURI}`);
        }

        const metadata = await response.json();

        // Render or use metadata to display the NFT image
        console.log("NFT Metadata:", metadata);
        this.successMessage = `NFT generated successfully! View your NFT at ${tokenURI}`;
      } catch (error) {
        console.error("Error generating NFT:", error);
        this.errorMessage = `Failed to generate NFT: ${error.message}`;
      }
    },
  }
};

</script>

<style scoped>
.campaign-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.campaign-description {
  font-size: 1.25rem;
  color: #6c757d;
}
.img-fluid {
  max-width: 100%;
  height: auto;
}
.campaign-info {
  font-size: 1.1rem;
}
.progress-bar {
  background-color: #4caf50;
}
.chart-area {
  height: 400px;
}
</style>
