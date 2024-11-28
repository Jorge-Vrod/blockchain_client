<template>
    <header class="text-center mb-4">
      <h1 class="campaign-title text-light">{{ campaign.name }}</h1>
      <p class="campaign-description text-muted">{{ campaign.subtitle }}</p>
    </header>
  </template>
  
  <script>
  export default {
    props: { campaign: Object },
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
  </style>
  