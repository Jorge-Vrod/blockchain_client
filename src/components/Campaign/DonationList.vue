<template>
  <!-- Recent Donors -->
  <div class="recent-donors">
    <p class="text-muted mb-2">
      <strong>
        {{ donations.length > 0 ? donations.length + " people just donated" : "No donations yet. Be the first!" }}
      </strong>
    </p>
    <ul v-if="donations.length > 0" class="list-group">
      <li
        v-for="(donation, index) in donations"
        :key="index"
        class="list-group-item bg-dark text-light d-flex justify-content-between"
      >
        <span>{{ donation.name }}</span>
        <strong>{{ donation.amount }} €</strong>
      </li>
    </ul>
    <div v-if="donations.length > 0" class="d-flex justify-content-between mt-3">
      <button class="btn btn-secondary text-center px-3">See all</button>
      <button
        class="btn btn-secondary text-center px-3 text-truncate"
        style="max-width: 200px;"
      >
        <i class="bi bi-star-fill"></i> See greatest donations
      </button>
    </div>
  </div>
</template>

  
  <script>
  export default {
    props: { donations: Array },
    computed: {
      recentDonations() {
        return Math.floor(Math.random() * (600 - 3) + 3);
      }
    }
  };
  </script>