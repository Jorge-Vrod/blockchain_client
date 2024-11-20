<template>
  <div class="row">
    <div class="col-md-8">
      <edit-profile-form :model="model"> </edit-profile-form>
      <div class="file-upload-section mt-4">
        <h4>Upload File to IPFS</h4>
        <form @submit.prevent="handleSubmit">
          <input type="file" @change="retrieveFile" class="form-control mb-3" />
          <button type="submit" class="btn btn-primary">Upload</button>
        </form>
        <div v-if="ipfsHash" class="mt-3">
          <p><strong>IPFS Hash:</strong> {{ ipfsHash }}</p>
          <a :href="'https://ipfs.io/ipfs/' + ipfsHash" target="_blank" class="btn btn-link">View File</a>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <user-card :user="user"></user-card>
    </div>
  </div>
</template>

<script>
import EditProfileForm from "./Profile/EditProfileForm";
import UserCard from "./Profile/UserCard";
import { create } from "kubo-rpc-client";
import { ethers } from "ethers";
import { Buffer } from "buffer";
import { addresses, abis } from "@/contracts"; // Update with your actual paths

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
      ipfsHash: "",
      file: null,
      client: null,
      ipfsContract: null,
      ZERO_ADDRESS: "0x0000000000000000000000000000000000000000000000000000000000000000",
    };
  },
  mounted() {
    this.initialize();
    this.readCurrentUserFile();
  },
  methods: {
    async initialize() {
      if (window.ethereum) {
        await window.ethereum.enable();
        const defaultProvider = new ethers.providers.Web3Provider(window.ethereum);
        this.ipfsContract = new ethers.Contract(
          addresses.ipfs,
          abis.ipfs,
          defaultProvider
        );
      } else {
        console.error("Ethereum wallet is not connected");
      }
    },
    async readCurrentUserFile() {
      const signer = this.ipfsContract.provider.getSigner();
      const result = await this.ipfsContract.userFiles(await signer.getAddress());
      if (result !== this.ZERO_ADDRESS) {
        this.ipfsHash = result;
      }
    },
    async setFileIPFS(hash) {
      const signer = this.ipfsContract.provider.getSigner();
      const ipfsWithSigner = this.ipfsContract.connect(signer);
      const tx = await ipfsWithSigner.setFileIPFS(hash);
      console.log("Transaction: ", tx);
      this.ipfsHash = hash;
    },
    async handleSubmit() {
      try {
        if (!this.file) {
          console.error("No file selected");
          return;
        }
        this.client = await create("/ip4/0.0.0.0/tcp/5001");

        // Upload file to IPFS
        const result = await this.client.add(this.file);

        // Save file to the local IPFS node
        await this.client.files.cp(`/ipfs/${result.cid}`, `/${result.cid}`);

        console.log("IPFS CID:", result.cid);

        // Save the CID to Ethereum via the smart contract
        await this.setFileIPFS(result.cid.toString());
      } catch (error) {
        console.error("Error during file upload:", error.message);
      }
    },
    retrieveFile(event) {
      const data = event.target.files[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(data);
      reader.onloadend = () => {
        this.file = Buffer.from(reader.result);
      };
    },
  },
};
</script>

<style scoped>
.file-upload-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
}
.file-upload-section h4 {
  margin-bottom: 20px;
}
</style>
