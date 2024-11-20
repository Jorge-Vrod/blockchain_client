<template>
    <div class="app">
      <header class="app-header">
        <img :src="logo" class="app-logo" alt="logo" />
        <p>Upload a file to store it on IPFS and save the hash on Ethereum.</p>
        <form class="form" @submit.prevent="handleSubmit">
          <input type="file" name="data" @change="retrieveFile" />
          <button type="submit" class="btn">Upload</button>
        </form>
      </header>
    </div>
  </template>
  
  <script>
  import { create } from "kubo-rpc-client";
  import { ethers } from "ethers";
  import { Buffer } from "buffer";
  import logo from "@/assets/ethereumLogo.png";
  import { addresses, abis } from "@/contracts"; // Adjust the import path to your contracts.
  
  export default {
    name: "IpfsFileUpload",
    data() {
      return {
        ipfsHash: "",
        file: null,
        client: null,
        ZERO_ADDRESS: "0x0000000000000000000000000000000000000000000000000000000000000000",
        ipfsContract: null,
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
  .app-header {
    text-align: center;
  }
  .app-logo {
    height: 40vmin;
    pointer-events: none;
  }
  .form {
    margin-top: 20px;
  }
  .btn {
    margin-top: 10px;
  }
  </style>
  