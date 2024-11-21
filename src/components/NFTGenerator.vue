<template>
    <div class="nft-generator">
      <canvas ref="canvas" width="600" height="600"></canvas>
  
      <div class="controls">
        <label>
          NFT Hash:
          <input type="text" v-model="nftHash" placeholder="Enter NFT Hash" />
        </label>
  
        <button @click="generateNFT">Generate NFT</button>
        <button @click="downloadNFT">Download NFT</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "NFTGenerator",
    data() {
      return {
        nftHash: "defaultHash", // Default NFT hash
        layers: [
          { name: "Background", images: ["layer1-bg1.png", "layer1-bg2.png", "layer1-bg3.png", "layer1-bg4.png"] },
          { name: "Character", images: ["layer2-char1.png", "layer2-char2.png"] },
          { name: "Eyes", images: ["layer3-eyes1.png", "layer3-eyes2.png", "layer3-eyes3.png"] },
          { name: "Accessories", images: ["layer3-acc1.png", "layer3-acc2.png", "layer3-acc3.png", "layer3-acc4.png", "layer3-acc5.png"] },
        ],
        imagesPath: "/templates/", // Adjust the path where your images are stored
      };
    },
    methods: {
      getHashIndex(hash, max) {
        let total = 0;
        for (let i = 0; i < hash.length; i++) {
          total += hash.charCodeAt(i);
        }
        return total % max;
      },
      async loadImage(src) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
        });
      },
      async generateNFT() {
        const canvas = this.$refs.canvas;
        const ctx = canvas.getContext("2d");
  
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        // Generate the NFT layers
        for (const layer of this.layers) {
          const index = this.getHashIndex(this.nftHash, layer.images.length);
          const imagePath = this.imagesPath + layer.images[index];
  
          try {
            const image = await this.loadImage(imagePath);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          } catch (error) {
            console.error(`Failed to load image: ${imagePath}`, error);
          }
        }
      },
      downloadNFT() {
        const canvas = this.$refs.canvas;
        const link = document.createElement("a");
        link.download = `nft-${this.nftHash}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      },
    },
    mounted() {
      this.generateNFT(); // Generate initial NFT
    },
  };
  </script>
  
  <style scoped>
  .nft-generator {
    text-align: center;
  }
  
  .controls {
    margin-top: 20px;
  }
  
  canvas {
    border: 1px solid #ddd;
    margin-bottom: 20px;
  }
  </style>
  