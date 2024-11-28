
<template>
  <div class="nft-generator">
    <canvas 
      ref="canvas" 
      width="120" 
      height="120" 
      class="rounded shadow-lg"
    ></canvas>
    <!--<button type="submit" class="btn w-100" @click="generateNFT">Generate NFT</button>-->
  </div>
</template>
  
  <script>
  export default {
    name: "NFTGenerator",
    props: {
      nftHash: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        layers: [
          { name: "Background", images: ["layer1-bg1.png", "layer1-bg2.png", "layer1-bg3.png", "layer1-bg4.png", "layer1-bg5.png"] },
          { name: "Character", images: ["layer2-char1.png", "layer2-char2.png", "layer2-char3.png", "layer2-char4.png", "layer2-char5.png", "layer2-char6.png"] },
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
        return (Math.floor((Date.now() / 1000) * Math.random()) + total) % max;
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
  