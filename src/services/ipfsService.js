import { create } from 'kubo-rpc-client'
import axios from 'axios';

export const uploadToIPFS = async (canvasBlob, userAddress) => {
  console.log("Uploading to IPFS");
  const client = create({ url: "/ip4/127.0.0.1/tcp/5001" });

  try {
    const fileResult = await client.add(canvasBlob);
    const filePath = `/${fileResult.cid}`;

    let fileExists = false;
    for await (const file of client.files.ls("/")) {
      if (file.name === fileResult.cid.toString()) {
        fileExists = true;
        break;
      }
    }

    if (fileExists) {
      await client.files.rm(filePath, { recursive: true });
    }

    await client.files.cp(`/ipfs/${fileResult.cid}`, filePath);

    // Associate the CID with the user's address in the database
    await associateCIDWithUser(userAddress, fileResult.cid.toString());

    return fileResult.cid;
  } catch (error) {
    console.error("Error during upload:", error.message);
    throw new Error("Error uploading image to IPFS.");
  }
};

// Helper function to associate the CID with the user's address in the database
const associateCIDWithUser = async (userAddress, cid) => {
  const lowerCaseAddress = userAddress.toLowerCase();
  try {

    // Check if user already exists
    const response = await axios.get(`http://localhost:5000/users/${lowerCaseAddress}`);

    if (response.status === 200) {
      // User exists, append CID to their list if not already present
      const user = response.data;
      if (!user.cids.includes(cid)) {
        user.cids.push(cid);
        await axios.put(`http://localhost:5000/users/${lowerCaseAddress}`, user);
        console.log("CID added to existing user record.");
      }
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // User does not exist, create a new record
      await axios.post('http://localhost:5000/users', {
        id: lowerCaseAddress, // Use the address as the ID
        cids: [cid]
      });
      console.log("New user record created with CID.");
    } else {
      console.error("Error associating CID with user:", error.message);
      throw new Error("Error saving CID to database.");
    }
  }
};

export const setFileIPFS = async (ipfsContract, signer, hash) => {
  const ipfsWithSigner = ipfsContract.connect(signer);
  const tx = await ipfsWithSigner.setFileIPFS(hash);
  await tx.wait();
  return hash;
};

export const readFileIPFS = async (ipfsContract, signer) => {
  const file = await ipfsContract.userFiles(signer.getAddress());
  return file;
};
