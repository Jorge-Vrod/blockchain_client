<template>
  <main>
    <div class="campaign-page container">
      <CampaignTitle v-if="campaign" :campaign="campaign" />
      <div v-if="campaign" class="row">
        <div class="col-lg-8">
          <CampaignDetails :campaign="campaign" :chart-data="greenLineChart" />
        </div>
        <div class="col-lg-4">
          <CampaignSidebar 
            :campaign="campaign"
            :recent-donations="recentDonations"
          />
        </div>
      </div>
      <div v-else>
        <p>Loading campaign...</p>
      </div>
    </div>
  </main>
</template>

<script>
import axios from "axios";
import CampaignTitle from "@/components/Campaign/CampaignTitle";
import CampaignDetails from "@/components/Campaign/CampaignDetails";
import CampaignSidebar from "@/components/Campaign/CampaignSidebar";
import * as chartConfigs from "@/components/Charts/config";
import config from "@/config";

export default {
  components: {
    CampaignTitle,
    CampaignDetails,
    CampaignSidebar,
  },
  props: { id: String }, // Campaign ID passed as a prop
  data() {
    return {
      campaign: null, // Placeholder for campaign data
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
  async created() {
    try {
      // Fetch campaign data by ID
      const response = await axios.get(`http://localhost:5000/campaigns/${this.id}`);
      this.campaign = response.data;
      this.campaign.dollarsFunded = Math.floor(this.campaign.objective * 0.4);
    } catch (error) {
      console.error("Error loading campaign data:", error);
    }
  },
};
</script>
