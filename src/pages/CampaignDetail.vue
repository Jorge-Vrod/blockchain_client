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
                    v-model="number"
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
import { create } from "kubo-rpc-client";
import { ethers } from "ethers";
import { Buffer } from "buffer";
import { addresses, abis } from "../contracts";
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
      ipfsHash: "",
      number: "",
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
    this.defaultProvider = new ethers.providers.Web3Provider(window.ethereum);
    this.ipfsContract = new ethers.Contract(
      addresses.ipfs,
      abis.ipfs,
      this.defaultProvider
    );

    window.ethereum.enable();
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
      await this.readFile();

      if (this.number === "" || isNaN(this.number) || this.number < 0 || this.number > 1000000) {
        this.errorMessage = "Please enter a valid number between 0 and 1,000,000.";
        this.uploadMessage = ""; // Clear previous messages if validation fails
        return;
      }

      this.errorMessage = "";
      this.uploadMessage = "Uploading image to IPFS...";

      try {
        const client = create({ url: "/ip4/127.0.0.1/tcp/5001" });

        const response = await fetch("https://picsum.photos/200");

        if (!response.ok) {
          throw new Error("Image file not found or inaccessible.");
        }

        const fileBuffer = await response.arrayBuffer();

        const fileResult = await client.add(Buffer.from(fileBuffer));

        const filePath = `/${fileResult.cid}`;

        let fileExists = false;
        for await (const file of client.files.ls("/")) {
          if (file.name === fileResult.cid.toString()) {
            fileExists = true;
            break;
          }
        }

        if (fileExists) {
          await client.files.rm(filePath, { recursive: true });
        }

        await client.files.cp(`/ipfs/${fileResult.cid}`, filePath);

        await this.setFileIPFS(fileResult.cid.toString());
        this.uploadMessage = "Image uploaded successfully! CID: " + fileResult.cid;
      } catch (error) {
        console.error("Error during upload:", error.message);
        this.uploadMessage = "Error uploading image to IPFS.";
      }
    },
  },
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
