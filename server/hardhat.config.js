require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545",
      accounts: ["0xab06e740b6d4cb0704cc53a75b7e51ecd018bbd3c69c20b241bccb08a0641ca3"], // Use a private key from Ganache
    },
  },
  solidity: "0.8.27",
};
//  ganache-cli --db ./data --mnemonic "split mind despair volume hen account reform buddy version hobby tourist duty" --i 1337 --defaultBalanceEther 100000