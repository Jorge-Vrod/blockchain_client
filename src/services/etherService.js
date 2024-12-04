import { ethers } from 'ethers';


const USD_TO_WEI_CONVERSION_RATE = ethers.BigNumber.from("277777777777777777");

export const connectMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed. Please install MetaMask and try again.");
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  console.log("MetaMask connected.");
};

export const weiToDollars = (weiAmount) => {
  const fundingInWei = ethers.BigNumber.from(weiAmount);
  return fundingInWei.div(USD_TO_WEI_CONVERSION_RATE).toNumber();
}

export const dollarsToWeis = (dollarAmount) => {
  const bigNumberDollars = ethers.BigNumber.from(dollarAmount);
  return USD_TO_WEI_CONVERSION_RATE.mul(bigNumberDollars);
}


export const handleDonation = async (campaignContract, localProvider, donationAmount) => {
  const signer = localProvider.getSigner();
  const campaignWithSigner = campaignContract.connect(signer);

  const signerAddress = await signer.getAddress();
  const provider = signer.provider;

  const initialBalance = await provider.getBalance(signerAddress);
  console.log("Signer's balance (ETH):", ethers.utils.formatEther(initialBalance));

  // Convert donationAmount to BigNumber
  const donationInWei = USD_TO_WEI_CONVERSION_RATE.mul(donationAmount);

  // Use the BigNumber in the transaction
  const tx = await campaignWithSigner.contribute({
    value: donationInWei,
  });

  return tx.wait();
};