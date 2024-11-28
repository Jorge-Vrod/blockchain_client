<template>
    <main>
      <div class="campaign-creation-page container">
        <header class="text-center mb-4">
          <h1 class="text-light">Create a New Campaign</h1>
        </header>
        <div class="row justify-content-center">
          <div class="col-lg-6">
            <CampaignCreationForm @submit="handleFormSubmit" />
          </div>
        </div>
      </div>
    </main>
  </template>
  
  <script>
  import CampaignCreationForm from "@/components/Campaign/CampaignCreationForm";
  
  export default {
    components: {
        CampaignCreationForm,
    },
    methods: {
      handleFormSubmit(campaignData) {
        console.log("Campaign Data Submitted:", campaignData);
        // You can add API calls or other logic here
        alert("Campaign Created Successfully!");
      },
    },
  };
  </script>
  
  <style scoped>
  .campaign-creation-page {
    margin-top: 50px;
  }
  </style>
  