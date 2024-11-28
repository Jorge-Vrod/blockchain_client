<template>
    <div class="progress-circle">
      <svg height="80" width="80" viewBox="-40 -40 80 80">
        <path
          d="M 0 -36 A 36 36 0 1 1 0 36 A 36 36 0 1 1 0 -36"
          fill="none"
          stroke="#f4f2ec"
          stroke-width="8"
        />
        <path
          d="M 0 -36 A 36 36 0 1 1 0 36 A 36 36 0 1 1 0 -36"
          fill="none"
          stroke="#02a95c"
          stroke-width="8"
          stroke-linecap="round"
          :style="{ strokeDasharray: progressData.stroke }"
        />
        <text x="0" y="6" text-anchor="middle" fill="#6F6F6F" font-size="16" font-weight="bold">
          {{ progressData.percentage }}%
        </text>
      </svg>
    </div>
  </template>
  
  <script>
  export default {
    props: { progressData: Object },
  };
  </script>