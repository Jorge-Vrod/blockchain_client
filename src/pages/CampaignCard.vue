<template>
    <div class="card h-100" @click="viewDetails">
      <img :src="campaign.image" class="card-img-top" alt="Campaign image" />
      <div class="card-body">
        <h5 class="card-title">{{ campaign.name }}</h5>
        <p class="card-text">{{ campaign.subtitle }}</p>
        <div class="progress mb-2">
          <div
            class="progress-bar"
            role="progressbar"
            :style="{ width: progressPercentage + '%' }"
            :aria-valuenow="campaign.dollarsFunded"
            :aria-valuemin="0"
            :aria-valuemax="campaign.objective"
          >
            {{ progressPercentage }}%
          </div>
        </div>
        <p>
          <strong>${{ campaign.dollarsFunded }}</strong> raised of
          <strong>${{ campaign.objective }}</strong>
        </p>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center">
        <button class="btn btn-primary">Donate</button>
        <div class="viewed-info">
          <i class="fas fa-eye"></i> {{ campaign.viewedLastHour }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "CampaignCard",
    props: {
      campaign: {
        type: Object,
        required: true,
      },
    },
    computed: {
      progressPercentage() {
        return ((this.campaign.dollarsFunded / this.campaign.objective) * 100).toFixed(2);
      },
    },
    methods: {
      viewDetails() {
        this.$router.push({ name: "CampaignPage", params: { id: this.campaign.id.toString() } });
      },
    },
  };
  </script>
  
  <style scoped>
  .card {
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
  }
  .card:hover {
    transform: scale(1.015);
  }
  .card-title {
    font-size: 1.25rem;
    font-weight: bold;
  }
  .card-img-top {
    max-height: 200px;
    object-fit: cover;
  }
  .progress {
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
  .viewed-info {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: #6c757d;
  }
  .viewed-info i {
    margin-right: 5px;
  }
  </style>
  