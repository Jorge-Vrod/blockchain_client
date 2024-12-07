<template>
  <div>
    <form @submit.prevent="submitForm" class="bg-dark p-4 rounded shadow">
      <div class="mb-3">
        <label for="campaignName" class="form-label text-light">Campaign Name</label>
        <input
          type="text"
          id="campaignName"
          v-model="form.name"
          class="form-control"
          placeholder="Enter campaign name"
          required
        />
      </div>

      <div class="mb-3">
        <label for="campaignSubtitle" class="form-label text-light">Subtitle</label>
        <input
          id="campaignSubtitle"
          v-model="form.subtitle"
          class="form-control"
          rows="3"
          placeholder="Enter campaign subtitle"
          required
        ></input>
      </div>

      <div class="mb-3">
        <label for="campaignDescription" class="form-label text-light">Description</label>
        <textarea
          id="campaignDescription"
          v-model="form.description"
          class="form-control"
          rows="3"
          placeholder="Enter campaign description"
          required
        ></textarea>
      </div>

      <div class="mb-3">
        <label for="campaignObjective" class="form-label text-light">Objective (in USD)</label>
        <input
          type="number"
          id="campaignObjective"
          v-model="form.objective"
          class="form-control"
          placeholder="Enter campaign objective"
          required
          min="0"
        />
      </div>

      <div class="mb-3">
        <label for="campaignImage" class="form-label text-light">Campaign Image</label>
        <input
          type="file"
          id="campaignImage"
          class="form-control"
          @change="handleImageUpload"
          accept="image/*"
          required
        />
        <div v-if="imagePreview" class="mt-3">
          <p class="text-light">Image Preview:</p>
          <img :src="imagePreview" alt="Image Preview" class="img-fluid rounded shadow" />
        </div>
      </div>

      <button type="submit" class="btn btn-primary w-100">Create Campaign</button>
    </form>
  </div>
</template>

<script>
import { ethers } from "ethers";
import axios from "axios";
import { dollarsToWeis } from '@/services/etherService'

export default {
  data() {
    return {
      form: {
        name: "",
        subtitle: "",
        description: "",
        objective: 0,
        image: null,
      },
      imagePreview: null,
      campaigns: [], // Loaded from mock server
    };
  },
  created() {
    this.loadCampaigns();
  },
  methods: {
    async loadCampaigns() {
      try {
        const response = await axios.get("http://localhost:5000/campaigns");
        this.campaigns = response.data;
      } catch (error) {
        console.error("Error loading campaigns:", error);
      }
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      this.form.image = file;

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.imagePreview = null;
      }
    },
    async submitForm() {
      if (!this.form.image) {
        alert("Please upload an image.");
        return;
      }

      try {
        var newId = this.campaigns.length + 1; // Assign sequential ID
        // Deploy the campaign contract on the blockchain
        const deployResponse = await axios.post("http://localhost:5002/deploy-campaign", {
          id: newId,
          goal: dollarsToWeis(this.form.objective)._hex, // Campaign goal
          duration: 10000000, // Example duration
        });

        const { address, abi, nftBadgeAddress } = deployResponse.data;

        // Create a new campaign object
        const newCampaign = {
          id: newId.toString(),
          name: this.form.name,
          subtitle: this.form.subtitle,
          description: this.form.description,
          objective: parseFloat(this.form.objective),
          contractAddress: address, // Save the deployed contract address
          nftBadgeAddress: nftBadgeAddress,
          image: this.imagePreview, // Base64-encoded image
        };

        // Save the campaign data to the mock database
        const response = await axios.post("http://localhost:5000/campaigns", newCampaign);
        this.campaigns.push(response.data);

        // Reset form
        this.form = {
          name: "",
          subtitle: "",
          description: "",
          objective: 0,
          image: null,
        };
        this.imagePreview = null;

        alert("Campaign created and deployed to the blockchain!");
      } catch (error) {
        console.error("Error creating campaign:", error);
        alert("Failed to create the campaign.");
      }
    },
  },
};
</script>

<style scoped>
form {
  max-width: 100%;
}

img {
  max-width: 100%;
  height: auto;
}

.list-group-item {
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
