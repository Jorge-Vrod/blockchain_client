<template>
  <div class="row">
    <div class="col-md-8">
      <edit-profile-form :model="model"> </edit-profile-form>
    </div>
    <div class="col-md-4">
      <user-card :user="user"></user-card>
      <div class="badges-section mt-4">
        <h4>Your Badges</h4>
        <div v-if="badges.length > 0">
          <ul class="badge-list">
            <li v-for="(badge, index) in badges" :key="index">
              <img :src="badge.imageData" alt="Badge" class="badge-image" />
            </li>
          </ul>
        </div>
        <div v-else>
          <p>No badges found.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EditProfileForm from "./Profile/EditProfileForm";
import UserCard from "./Profile/UserCard";
import axios from "axios";
import { ethers } from "ethers";
import { create } from "kubo-rpc-client";

export default {
  components: {
    EditProfileForm,
    UserCard,
  },
  data() {
    return {
      model: {
        company: "Creative Code Inc.",
        email: "mike@email.com",
        username: "michael23",
        firstName: "Mike",
        lastName: "Andrew",
        address: "Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09",
        city: "Melbourne",
        country: "Australia",
        about:
          "Lamborghini Mercy, Your chick she so thirsty, I'm in that two seat Lambo.",
      },
      user: {
        fullName: "Mike Andrew",
        title: "Ceo/Co-Founder",
        description: `Do not be scared of the truth because we need to restart the human foundation in truth And I love you like Kanye loves Kanye I love Rick Owens’ bed design but the back is...`,
      },
      badges: [], // Array to store badges with images
    };
  },
  async created() {
    await this.fetchBadges();
  },
  methods: {
    async fetchBadges() {
      try {
        window.ethereum.enable();

        this.localProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

        // Get user Ethereum address
        const signerAddress = (await this.localProvider.getSigner().getAddress()).toLowerCase();

        // Fetch the user's badge CIDs from the JSON server
        const response = await axios.get(
          `http://localhost:5000/users/${signerAddress}`
        );

        if (response.data && response.data.cids) {
          const cids = response.data.cids;

          // Initialize IPFS client
          const ipfs = create({ url: "/ip4/127.0.0.1/tcp/5001" });

          // Retrieve files for each CID
          const badgesWithFiles = await Promise.all(
            cids.map(async (cid) => {
              try {
                // Fetch the file as a Uint8Array
                const chunks = [];
                console.log("Retrieving file from IPFS with CID:", cid);
                for await (const chunk of ipfs.cat(cid)) {
                  chunks.push(chunk);
                }

                const fileData = new Uint8Array(chunks.reduce((acc, chunk) => {
                  const array = new Uint8Array(chunk);
                  return [...acc, ...array];
                }, [])); 
                console.log(fileData);

                if (fileData.length === 0) {
                  console.error(`No data retrieved for CID: ${cid}`);
                  return { cid, imageData: null };
                }

                const base64Data = btoa(
                  Array.from(fileData)
                    .map((byte) => String.fromCharCode(byte))
                    .join("")
                );
                const imageData = `data:image/png;base64,${base64Data}`; // Assuming the file is PNG

                return { cid, imageData };
              } catch (error) {
                console.error(`Error retrieving file for CID ${cid}:`, error.message);
                return { cid, imageData: null };
              }
            })
          );

          this.badges = badgesWithFiles.filter((badge) => badge.imageData); // Exclude badges without valid image data
        }
      } catch (error) {
        console.error("Error fetching badges:", error.message);
        this.badges = [];
      }
    },
  },
};
</script>

<style scoped>
.badges-section {
  padding: 20px;
  border-radius: 5px;
}
.badge-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
}
.badge-list li {
  margin: 10px;
}
.badge-image {
  width: 100px;
  height: 100px;
  border-radius: 5px;
  object-fit: cover;
}
</style>
