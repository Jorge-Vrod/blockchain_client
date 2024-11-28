<template>
  <main>
    <div class="campaign-page container">
      <!-- Campaign Title -->
      <header class="text-center mb-4">
        <h1 class="campaign-title text-light">{{ campaign.name }}</h1>
        <p class="campaign-description text-muted">{{ campaign.description }}</p>
      </header>

      <div class="row">
        <!-- Campaign Information -->
        <div class="col-lg-8">
          <!-- Campaign Image -->
          <div class="campaign-image mb-4">
            <img
              :src="campaign.image"
              alt="Campaign Image"
              class="img-fluid rounded shadow-lg"
            />
          </div>

          <!-- Campaign Story -->
          <div class="campaign-story mb-4">
            <h4>Historia</h4>
            <p class="text-muted">{{ campaign.story }}</p>
          </div>

          <!-- Campaign Objectives -->
          <div class="campaign-objectives mb-4">
            <h4>Campaign Objectives</h4>
            <ul class="list-group">
              <li class="list-group-item bg-dark text-light">
                <strong>$100,000:</strong> Saving the forest by protecting endangered areas.
              </li>
              <li class="list-group-item bg-dark text-light">
                <strong>$200,000:</strong> Launch a large-scale reforestation project.
              </li>
              <li class="list-group-item bg-dark text-light">
                <strong>$500,000:</strong> Create long-term conservation programs involving local communities.
              </li>
            </ul>
          </div>

          <!-- Donation Progress Chart -->
          <div class="chart-area bg-dark rounded p-3 shadow">
            <line-chart
              style="height: 100%; width: 100%;"
              chart-id="green-line-chart"
              :chart-data="greenLineChart.chartData"
              :gradient-stops="greenLineChart.gradientStops"
              :extra-options="greenLineChart.extraOptions"
            ></line-chart>
          </div>
        </div>

        <!-- Sticky Sidebar -->
        <div class="col-lg-4">
          <aside class="bg-dark rounded p-4 shadow sticky-sidebar">
            <!-- Progress Meter -->
            <div class="progress-meter d-flex align-items-center mb-4">
              <!-- Left Section: Funded and Needed Money -->
              <div class="text-left">
                <h3 class="text-success mb-1">{{ formattedFundsRaised }} € recaudados</h3>
                <p class="text-muted mb-0">
                  <strong>Objetivo de {{ formattedFundsNeeded }} €</strong>
                </p>
              </div>

              <div class="flex-grow-1"></div>

              <!-- Right Section: Progress Circle -->
              <div class="ms-auto">
                <div class="progress-circle">
                  <svg height="80" width="80" viewBox="-40 -40 80 80">
                    <path
                      d="M 0 -36 A 36 36 0 1 1 0 36 A 36 36 0 1 1 0 -36"
                      fill="none"
                      stroke="#f4f2ec"
                      stroke-width="8"
                    />
                    <path
                      d="M 0 -36 A 36 36 0 1 1 0 36 A 36 36 0 1 1 0 -36"
                      fill="none"
                      stroke="#02a95c"
                      stroke-width="8"
                      stroke-linecap="round"
                      :style="{ strokeDasharray: progressCircleStroke }"
                    />
                    <text
                      x="0"
                      y="6"
                      text-anchor="middle"
                      fill="#6F6F6F"
                      font-size="16"
                      font-weight="bold"
                    >
                      {{ progressPercentage }}%
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="d-grid gap-2 mb-3">
              <button class="btn btn-warning btn-lg">Donar ahora</button>
              <button class="btn btn-outline-secondary btn-lg">Compartir</button>
            </div>

            <!-- Recent Donors -->
            <div class="recent-donors">
              <p class="text-muted mb-2"><strong>617 personas acaban de donar</strong></p>
              <ul class="list-group">
                <li
                  v-for="(donation, index) in recentDonations"
                  :key="index"
                  class="list-group-item bg-dark text-light d-flex justify-content-between"
                >
                  <span>{{ donation.name }}</span>
                  <strong>{{ donation.amount }} €</strong>
                </li>
              </ul>
              <div class="d-flex justify-content-between mt-3">
                <button class="btn btn-secondary text-center px-3">Ver todo</button>
                <button
                  class="btn btn-secondary text-center px-3 text-truncate"
                  style="max-width: 200px;"
                >
                  <i class="bi bi-star-fill"></i> Ver mayores donativos
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </main>
</template>


<script>
import LineChart from "@/components/Charts/LineChart";
import * as chartConfigs from "@/components/Charts/config";
import config from "@/config";
import { ethers } from "ethers";
import { Campaign, NFTBadge, IPFS } from "@/config";
import NFTGenerator from "@/components/NFTGenerator.vue";
import { create } from 'kubo-rpc-client'

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
      localProvider: null,
      ipfsContract: null,
      campaignContract: null,
      nftBadgeContract: null,
      nftHash: null,
      campaign: {
        name: "Buenos dias",
        description:
          "Epico",
        objective: 64000,
        dollarsFunded: 34000,
        image:
          "https://images.gofundme.com/kHJy-yu3kVQ1-P1faZ76EzZGLLI=/720x405/https://d2g8igdw686xgo.cloudfront.net/75380811_1694718762233171_r.jpeg",
        story: `
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ac tortor ac tortor scelerisque gravida. Morbi sed diam dui. Maecenas feugiat varius imperdiet. Morbi ornare aliquam odio, nec lacinia justo vulputate in. Ut viverra tempor tristique. Etiam hendrerit nisl id magna convallis auctor. Cras finibus faucibus libero, quis porta elit mollis et. Integer tortor ipsum, pharetra eget felis a, eleifend lacinia lectus. In porttitor odio quis massa efficitur tincidunt sit amet vel ex.

          Proin pulvinar congue urna vitae porttitor. Duis urna sapien, pharetra ullamcorper feugiat eget, placerat eget nisi. Nunc sed enim nunc. Vivamus ipsum enim, varius sit amet nisi at, euismod porta quam. Integer ullamcorper dui ut varius tempus. Mauris interdum luctus pellentesque. Ut euismod ipsum vehicula efficitur vulputate. Nulla facilisi. Duis aliquam semper neque, a fringilla massa. Morbi massa lacus, dapibus malesuada accumsan eu, fermentum ac nunc. Vestibulum vitae urna in nunc ornare posuere et ac arcu. Nulla cursus egestas mi, vitae commodo orci tempor euismod. Pellentesque semper, ipsum non euismod bibendum, lorem enim mattis lectus, eget congue sem nunc ut libero. Ut placerat malesuada purus nec ullamcorper. Fusce venenatis aliquam laoreet.

          Ut tempor interdum vehicula. Nulla aliquam tortor rhoncus metus bibendum facilisis sed in lacus. Praesent ornare sodales neque, eget scelerisque lorem commodo ut. Suspendisse consectetur purus nec nulla pharetra suscipit. Quisque fermentum, ipsum finibus pulvinar egestas, est nibh congue mi, nec accumsan lorem sapien eu tellus. Maecenas luctus orci nulla, eget sagittis justo pulvinar in. Donec ante massa, rhoncus et ligula nec, eleifend fermentum dui. In ac purus nec magna aliquam viverra in egestas libero. Duis porttitor, ipsum et gravida vulputate, nulla nulla maximus elit, at accumsan orci orci nec massa. Duis id ultrices enim. Phasellus tincidunt semper sem at pulvinar. Vestibulum nec lorem at nibh sagittis iaculis vulputate sit amet massa.

          Aliquam in eleifend quam. Mauris vel tristique velit. In bibendum iaculis leo ut elementum. Duis tristique accumsan mi, ut iaculis est sodales nec. Phasellus diam enim, placerat a eros at, varius finibus magna. Sed id eros lacus. Sed vulputate eros id lacus porttitor faucibus.

          Donec et quam ac nibh commodo dictum non commodo velit. Proin tempor vitae purus eget pulvinar. Sed facilisis vel mauris eget maximus. Integer ligula quam, dignissim sit amet lorem vel, consectetur venenatis eros. Praesent pellentesque tortor in neque fermentum vehicula. Aenean eget sagittis erat, vel molestie lacus. Sed quis accumsan elit, vitae tempus erat. Phasellus turpis magna, ullamcorper at luctus ac, mattis sed nisl. Aenean quis sem facilisis, sollicitudin nibh a, condimentum urna. Ut tristique nunc tincidunt, egestas justo sit amet, maximus nisl. Fusce varius orci a orci congue, a vehicula tellus suscipit. Etiam vel odio a ligula laoreet iaculis. 
        `,
      },
      recentDonations: [
        { name: "Anónimo", amount: 2000 },
        { name: "Anónimo", amount: 2000 },
        { name: "Ludmilla Cuevas Fenoll", amount: 15 },
      ],
      greenLineChart: {
        extraOptions: chartConfigs.greenChartOptions,
        chartData: {
          labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10", "Day 11", "Day 12", "Day 13"],
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
              data: [20, 23, 30, 41, 46, 53, 75, 90, 95, 103, 135, 142, 180],
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
      return ((this.campaign.dollarsFunded / this.campaign.objective) * 100).toFixed(2);
    },
    formattedFundsRaised() {
      return new Intl.NumberFormat().format(this.campaign.dollarsFunded);
    },
    formattedFundsNeeded() {
      return new Intl.NumberFormat().format(this.campaign.objective);
    },
    progressPercentage() {
      return Math.min(
        ((this.campaign.dollarsFunded / this.campaign.objective) * 100).toFixed(0),
        100
      );
    },
    progressCircleStroke() {
      const circumference = 226; // Circle circumference
      const progress = (this.campaign.dollarsFunded / this.campaign.objective) * circumference;
      return `${progress}, ${circumference}`;
    },
  },
  beforeUnmount() {
    this.nftBadgeContract.removeAllListeners("BadgeMinted");
  },
  async created() {
    this.localProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"); // Local Hardhat node
    this.defaultProvider = new ethers.providers.Web3Provider(window.ethereum);

    this.ipfsContract = new ethers.Contract(
      IPFS.address,
      IPFS.abi,
      this.defaultProvider
    );

    this.campaignContract = new ethers.Contract(
      Campaign.address,
      Campaign.abi,
      this.localProvider
    );

    this.nftBadgeContract = new ethers.Contract(
      NFTBadge.address,
      NFTBadge.abi,
      this.localProvider
    );

    window.ethereum.enable();

    this.setupBadgeMintedListener();
  },
  methods: {
    async connectMetaMask() {
      try {
        if (!window.ethereum) {
          throw new Error("MetaMask not installed. Please install MetaMask and try again.");
        }

        // Request MetaMask to connect
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("MetaMask connected.");
      } catch (error) {
        console.error("Error connecting to MetaMask:", error.message);
        alert("Error connecting to MetaMask: " + error.message);
      }
    },
    async readFile() {
      const signer = await this.localProvider.getSigner();
      const file = await this.ipfsContract.userFiles(signer.getAddress());
      if (file !== ZERO_ADDRESS) {
        this.ipfsHash = file;
      }
      return true;
    },
    async setFileIPFS(hash) {
      const ipfsWithSigner = this.ipfsContract.connect(
        this.localProvider.getSigner()
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
        const signer = this.localProvider.getSigner();
        const campaignWithSigner = this.campaignContract.connect(signer);

        // Send contribution
        const tx = await campaignWithSigner.contribute({
          value: ethers.utils.parseEther(this.donationAmount.toString()),
        });

        // Wait for transaction to be mined
        let receipt = await tx.wait();
        

        this.successMessage = "Donation successful! Waiting for badge generation...";
      } catch (error) {
        console.error("Error processing donation:", error);
        this.errorMessage = "There was an issue with your donation. Please try again.";
      }
    },
    async uploadToIPFS() {
      this.errorMessage = "";
      this.uploadMessage = "Uploading image to IPFS...";

      try {
        const client = create({ url: "/ip4/127.0.0.1/tcp/5001" });

        // Get the canvas data from the child component
        const nftGenerator = this.$refs['nftGenerator'];
        if (!nftGenerator) {
          return;
        }
        const canvas = nftGenerator.$refs.canvas;

        // Convert canvas to Blob
        const canvasBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );

        if (!canvasBlob) {
          throw new Error("Failed to generate canvas image blob.");
        }

        // Upload to IPFS
        const fileResult = await client.add(canvasBlob);

        const filePath = `/${fileResult.cid}`;

        // Check if file exists in IPFS
        let fileExists = false;
        for await (const file of client.files.ls("/")) {
          if (file.name === fileResult.cid.toString()) {
            fileExists = true;
            break;
          }
        }

        // Remove the old file if it exists
        if (fileExists) {
          await client.files.rm(filePath, { recursive: true });
        }

        // Copy file to IPFS
        await client.files.cp(`/ipfs/${fileResult.cid}`, filePath);

        // Display success message
        this.uploadMessage = "Image uploaded successfully! CID: " + fileResult.cid;
        console.log(this.uploadMessage);
      } catch (error) {
        console.error("Error during upload:", error.message);
        this.uploadMessage = "Error uploading image to IPFS.";
      }
    },
    setupBadgeMintedListener() {
      this.nftBadgeContract.removeAllListeners("BadgeMinted");
      this.nftBadgeContract.on("BadgeMinted", async (badgeId, recipient, tierIndex) => {
        console.log("BadgeMinted event detected:", badgeId, recipient, tierIndex);

        // Check recipient address and update UI
        const signerAddress = (await this.localProvider.getSigner().getAddress()).toLowerCase();
        if (recipient.toLowerCase() === signerAddress) {
          this.successMessage = `Badge minted successfully! Badge ID: ${badgeId}`;
          this.nftHash = badgeId._hex;
          if (this.nftHash) {
            await this.uploadToIPFS();
          }
        }
      });
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
.progress {
    width: 65%;
    height: 1rem; /* Adjust the height of the container */
    background-color: #e9ecef; /* Optional: Set a neutral background for the container */
    border-radius: 6px; /* Match the radius of the progress bar */
    overflow: hidden; /* Prevent overflow of the bar */
}
.progress-bar {
    background-color: #4caf50;
    height: 100%; /* Ensure the bar fills the height of the container */
    border-radius: inherit; /* Match the container's radius */
}
.sticky-sidebar {
  position: sticky;
  top: 20px; /* Adds 20px padding from the top when sticky */
}
</style>
