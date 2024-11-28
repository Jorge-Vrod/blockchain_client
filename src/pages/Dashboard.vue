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
          campaigns: [
            {
              id: 1,
              name: "Save the Rainforest",
              description: "Help us save the Amazon rainforest by funding reforestation projects.",
              objective: 50000,
              dollarsFunded: 40000,
              image: "https://placehold.co/600x400/EEE/31343C",
              viewedLastHour: 90,
            },
            {
              id: 2,
              name: "Ocean Cleanup Project",
              description: "Join our mission to remove plastic waste from the world's oceans.",
              objective: 80000,
              dollarsFunded: 55000,
              image: "https://placehold.co/600x400/EEE/31343C",
              viewedLastHour: 90,
            },
          ],
        },
        latestCampaigns: {
          name: "Latest Campaigns 📆",
          description: "Check out the newest campaigns on our platform!",
          campaigns: [
            {
              id: 3,
              name: "Community Library Project",
              description: "Provide resources to underprivileged communities.",
              objective: 20000,
              dollarsFunded: 5000,
              image: "https://placehold.co/600x400/EEE/31343C",
              viewedLastHour: 60,
            },
            {
              id: 4,
              name: "Disaster Relief Fund",
              description: "Provide immediate aid to those affected by recent natural disasters.",
              objective: 100000,
              dollarsFunded: 25000,
              image: "https://placehold.co/600x400/EEE/31343C",
              viewedLastHour: 70,
            },
          ],
        },
        forYou: {
          name: "For You 🫵",
          description: "Campaigns we think you'll love!",
          campaigns: [
            {
              id: 5,
              name: "Support Local Artists",
              description: "Provide funding to help talented artists showcase their work.",
              objective: 15000,
              dollarsFunded: 12000,
              image: "https://placehold.co/600x400/EEE/31343C",
              viewedLastHour: 50,
            },
            {
              id: 6,
              name: "Wildlife Sanctuary",
              description: "Fund the creation of safe havens for endangered species.",
              objective: 60000,
              dollarsFunded: 30000,
              image: "https://placehold.co/600x400/EEE/31343C",
              viewedLastHour: 80,
            },
          ],
        },
      },
    };
  },

  methods: {
    progressPercentage(campaign) {
      return ((campaign.dollarsFunded / campaign.objective) * 100).toFixed(2);
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
