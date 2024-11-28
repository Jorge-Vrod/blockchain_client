<template>
  <!-- Recent Donors -->
  <div class="recent-donors">
    <p class="text-muted mb-2"><strong>617 personas acaban de donar</strong></p>
    <ul class="list-group">
      <li
        v-for="(donation, index) in donations"
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
  </template>
  
  <script>
  export default {
    props: { donations: Array },
  };
  </script>