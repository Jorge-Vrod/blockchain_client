<template>
  <div>
    <div class="row">
      <!-- Iterate over topics -->
      <div
        v-for="(topic, index) in Object.values(topics)"
        :key="index"
        class="col-lg-4 col-md-6 mb-4"
      >
        <div class="topic-column">
          <!-- Topic Title -->
          <div class="row mb-3">
            <div class="col-12">
              <h2 class="text-center">{{ topic.name }}</h2>
              <p class="text-center">{{ topic.description }}</p>
            </div>
          </div>
          <hr class="topic-separator" />
          <!-- Campaigns under each topic -->
          <div class="row">
            <div
              v-for="campaign in topic.campaigns"
              :key="campaign.id"
              class="col-12 mb-4"
            >
              <div class="campaign-card-wrapper">
                <campaign-card :campaign="campaign"></campaign-card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CampaignCard from "./CampaignCard.vue";
import { ethers } from "ethers";
import { Campaign } from "@/config";
import { weiToDollars } from "@/services/etherService";
import axios from "axios";

export default {
  components: {
    CampaignCard,
  },
  data() {
    return {
      topics: {
        hotTopics: {
          name: "Hot Topics 🔥",
          description: "Check out the most popular campaigns right now!",
          campaigns: [],
        },
        latestCampaigns: {
          name: "Latest Campaigns 📆",
          description: "Check out the newest campaigns on our platform!",
          campaigns: [],
        },
        forYou: {
          name: "For You 🫵",
          description: "Campaigns we think you'll love!",
          campaigns: [],
        },
      },
      provider: null,
    };
  },

  async created() {
    this.provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

    const campaignsFromDb = await this.fetchCampaignsFromDatabase();
    const campaigns = await this.fetchCampaignsWithBlockchainDetails(campaignsFromDb);

    this.distributeCampaignsByTopics(campaigns);
  },

  methods: {
    async fetchCampaignsFromDatabase() {
      try {
        const response = await axios.get("http://localhost:5000/campaigns", {
          params: {
            _limit: 10,
          },
        });
        return response.data.sort((a, b) => 0.5 - Math.random());
      } catch (error) {
        console.error("Error fetching campaigns from database:", error.message);
        return [];
      }
    },
    async fetchCampaignsWithBlockchainDetails(campaignsFromDb) {
      const campaignsWithDetails = [];

      for (const campaign of campaignsFromDb) {
        try {
          const campaignContract = new ethers.Contract(
            campaign.contractAddress,
            Campaign.abi,
            this.provider
          );

          const campaignStatus = await campaignContract.getCampaignStatus();
          campaignsWithDetails.push({
            ...campaign,
            creatorAddress: campaignStatus[0],
            dollarsFunded: weiToDollars(campaignStatus[1]._hex),
            isFunded: campaignStatus[4],
          });
        } catch (error) {
          console.error(`Error fetching blockchain data for campaign ${campaign.id}:`, error.message);
        }
      }

      return campaignsWithDetails;
    },

    distributeCampaignsByTopics(campaigns) {
      this.topics.hotTopics.campaigns = campaigns.slice(0, 2); // Top 2 campaigns as "Hot Topics"
      this.topics.latestCampaigns.campaigns = campaigns.slice(2, 4); // Next 2 campaigns as "Latest Campaigns"
      this.topics.forYou.campaigns = campaigns.slice(4); // Remaining campaigns as "For You"
    },
  },
};
</script>


<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.card-title {
  font-size: 1.25rem;
  font-weight: bold;
}
.card-img-top {
  max-height: 200px;
  object-fit: cover;
}
.progress-bar {
  background-color: #4caf50;
}
.topic-column {
  text-align: center;
}

.campaign-card-wrapper {
  max-width: 90%; /* Adjusts card width to be narrower */
  margin: 0 auto; /* Centers the card */
}

.topic-separator {
  height: 1px; /* Set the height of the separator */
  margin: 20px auto; /* Center the separator and add space above/below */
  width: 75%; /* Reduce width and center it */
  background: linear-gradient(
    to right,
    rgb(255, 255, 255, 0.25), /* 50% transparency at the start */
    rgb(255, 255, 255, 1),   /* 0% transparency in the middle */
    rgb(255, 255, 255, 0.25)  /* 50% transparency at the end */
  );
  border: none; /* Remove border if previously used */
}

</style>
