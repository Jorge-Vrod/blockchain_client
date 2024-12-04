<template>
    <div>
      <img :src="campaign.image" alt="Campaign Image" class="img-fluid rounded shadow-lg mb-4" />
      <div class="campaign-story">
        <h4>Story</h4>
        <p class="text-muted">{{ campaign.description }}</p>
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
      <line-chart               
        chart-id="green-line-chart"
        :chart-data="chartData.chartData"
        :gradient-stops="chartData.gradientStops"
        :extra-options="chartData.extraOptions" 
        style="height: 100%; width: 100%;" />
    </div>
  </template>
  
  <script>
  import LineChart from "@/components/Charts/LineChart";
  
  export default {
    components: { LineChart },
    props: {
      campaign: Object,
      chartData: Object,
    },
  };
  </script>
  <style scoped>
  .img-fluid {
    max-width: 100%;
    height: auto;
  }
  .chart-area {
    height: 400px;
  }
  </style>
  