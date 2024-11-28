<template>
  <aside class="bg-dark rounded p-4 shadow sticky-sidebar">
    <div class="progress-meter d-flex align-items-center justify-content-between mb-4">
      <div class="progress-info w-50 text-start pe-3">
        <h3 class="text-success mb-1">{{ formattedFundsRaised }} € recaudados</h3>
        <p class="text-muted mb-0">
          <strong>Objetivo de {{ formattedFundsNeeded }} €</strong>
        </p>
      </div>
      <div class="progress-circle w-50 text-end ps-3">
        <ProgressCircle
          :progress-data="{percentage: progressPercentage, stroke: progressCircleStroke}"
        />
      </div>
    </div>
    <button class="btn btn-warning btn-lg w-100 mb-3">Donar ahora</button>
    <button class="btn btn-outline-secondary btn-lg w-100">Compartir</button>
    <DonationList :donations="recentDonations" />
  </aside>
</template>
  
  <script>
  import ProgressCircle from "@/components/Campaign/ProgressCircle";
  import DonationList from "@/components/Campaign/DonationList";
  
  export default {
    components: { ProgressCircle, DonationList },
    props: {
        campaign: Object,   
        recentDonations: Array,
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
    }
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
  </style>