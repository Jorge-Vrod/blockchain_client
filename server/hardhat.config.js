require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545",
      accounts: ["0x27d920b5a977a53c678bb116a0a0542b16cc2154ea9de366d75eafbc91ffda9d"], // Use a private key from Ganache
    },
  },
  solidity: "0.8.27",
};
